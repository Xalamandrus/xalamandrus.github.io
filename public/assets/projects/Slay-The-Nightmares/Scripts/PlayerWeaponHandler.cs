using Game.Enums;
using Game.Weapons;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.VFX;

namespace Game.Entity.Player
{
    public class PlayerWeaponHandler : MonoBehaviour
    {
        #region Serialized Fields

        [Header("Settings")]
        [field: SerializeField] public LayerMask EnemyLayerMask { get; private set; }

        [Header("Weapons")]
        [SerializeField] private List<WeaponDataSO> _availableWeapons = new();

        #endregion

        #region Public Properties

        public WeaponDataSO EquippedWeapon { get; private set; }

        #endregion

        #region Private Fields

        private Player _player;

        private int _equippedWeaponIndex = 0;
        private bool _isOnCooldown = false;
        private bool _canRotatePivot = true;
        private bool _attackHeld = false;

        private GameObject _activeManualEffect;

        #endregion

        #region Unity Events

        private void Awake()
        {
            _player = GetComponent<Player>();
            EquippedWeapon = _availableWeapons[_equippedWeaponIndex];
        }

        private void OnEnable()
        {
            _player.OnAttackStart += OnAttackPressed;
            _player.OnAttackStop += OnAttackReleased;
            _player.OnEquipWeapon += EquipWeapon;
        }

        private void OnDisable()
        {
            _player.OnAttackStart -= OnAttackPressed;
            _player.OnAttackStop -= OnAttackReleased;
            _player.OnEquipWeapon -= EquipWeapon;
        }

        private void FixedUpdate()
        {
            if (!_canRotatePivot) return;

            Vector2 input = _player.InputActions.Player.Move.ReadValue<Vector2>();
            if (input.sqrMagnitude <= 0.01f) return;

            Vector3 inputDir = new Vector3(input.x, 0f, input.y);
            Quaternion targetRotation = Quaternion.LookRotation(inputDir, Vector3.up) * Quaternion.Euler(0, 90f, 0);
            _player.Pivot.rotation = Quaternion.Slerp(_player.Pivot.rotation, targetRotation, 10f * Time.fixedDeltaTime);
        }

        #endregion

        #region Attack Handling

        private void OnAttackPressed()
        {
            if (!CanAttack()) return;

            _attackHeld = true;

            bool isCharge = _player.CurrentState is IChargeable;
            if (!isCharge) _isOnCooldown = true;

            SetAttackState(EquippedWeapon.WeaponType);

            if (!isCharge)
                StartCoroutine(CooldownRoutine(EquippedWeapon.WeaponStats.AttackCooldown));
        }

        private void OnAttackReleased()
        {
            _attackHeld = false;

            if (_player.CurrentState is IChargeable chargeable)
            {
                chargeable.OnRelease();
                _isOnCooldown = true;
                StartCoroutine(CooldownRoutine(EquippedWeapon.WeaponStats.AttackCooldown));
            }
        }

        public void ForceStopAttack()
        {
            _attackHeld = false;
            _isOnCooldown = false;
            StopAllCoroutines();
        }

        private bool CanAttack() =>
            !_isOnCooldown && EquippedWeapon != null && !_attackHeld;

        private void SetAttackState(WeaponType type)
        {
            switch (type)
            {
                case WeaponType.Horn:
                    _player.SetState(new HornAttackState(_player, this));
                    break;

                case WeaponType.Lance:
                    _player.SetState(new LanceAttackState(_player, this));
                    break;

                case WeaponType.Hammer:
                    _player.SetState(new HammerAttackState(_player, this));
                    break;

                default:
                    Debug.LogWarning($"[WeaponHandler] Unsupported weapon type: {type}");
                    break;
            }
        }

        public IEnumerator CooldownRoutine(float duration)
        {
            _isOnCooldown = true;

            UI.UIManager.Instance.UIWeaponCooldown(_equippedWeaponIndex, duration);
            yield return new WaitForSeconds(duration);

            _isOnCooldown = false;
        }

        #endregion

        #region Weapon Equipping

        private void EquipWeapon(int weaponIndex)
        {
            if (!CanEquipWeapon(weaponIndex)) return;

            int newIndex = weaponIndex - 1;
            _isOnCooldown = true;
            EquippedWeapon = _availableWeapons[newIndex];
            _equippedWeaponIndex = newIndex;

            StartCoroutine(CooldownRoutine(1f));
            Debug.Log($"[WeaponHandler] Equipped: {EquippedWeapon.WeaponType}");
            _player.AnimationController.SetWeapon(EquippedWeapon.WeaponType);
        }

        private bool CanEquipWeapon(int weaponIndex)
        {
            if (_isOnCooldown || _attackHeld) return false;
            if (weaponIndex < 1 || weaponIndex > _availableWeapons.Count) return false;

            int newIndex = weaponIndex - 1;
            return newIndex != _equippedWeaponIndex;
        }

        #endregion

        #region Effects

        public void SpawnWeaponEffect(int index, Transform origin, string eventName, bool isFlip = true, float? size = null)
        {
            if (!IsValidEffectIndex(index)) return;

            WeaponEffect effect = EquippedWeapon.WeaponAttackEffects[index];
            if (effect.Effect == null) return;

            Vector3 offset = isFlip ? GetMirroredOffset(effect.Offset) : effect.Offset;
            Vector3 spawnPosition = _player.Pivot.position + origin.transform.TransformDirection(offset);

            var instance = Instantiate(effect.Effect, spawnPosition, Quaternion.identity, origin.transform);

            if (size.HasValue)
                instance.transform.localScale = Vector3.one * size.Value;

            instance.transform.localRotation = Quaternion.identity;

            if (instance.TryGetComponent<VisualEffect>(out var vfx))
                vfx.SendEvent(eventName);
            else if (instance.TryGetComponent<ParticleSystem>(out var ps))
                ps.Play();

            if (effect.DestroyManually)
            {
                if (_activeManualEffect != null) Destroy(_activeManualEffect);
                _activeManualEffect = instance.gameObject;
            }
            else
                Destroy(instance.gameObject, effect.Lifetime);
        }

        public void DestroyActiveEffect()
        {
            if (_activeManualEffect != null)
            {
                Destroy(_activeManualEffect);
                _activeManualEffect = null;
            }
        }

        private bool IsValidEffectIndex(int index) =>
            index >= 0 && index < EquippedWeapon.WeaponAttackEffects.Length;

        private Vector3 GetMirroredOffset(Vector3 offset)
        {
            if (_player.Body.localScale.x < 0f)
                offset.x *= -1;

            return offset;
        }

        #endregion
    }
}
