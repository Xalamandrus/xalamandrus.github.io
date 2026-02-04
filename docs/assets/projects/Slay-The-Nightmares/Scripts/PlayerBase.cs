using Game.Effects;
using Game.Entity.Stats;
using Game.UI;
using System.Collections;
using UnityEngine;

namespace Game.Entity.Player
{
    public abstract class PlayerBase<TStats, TRuntime> : EntityBase, IPlayer
        where TStats : EntityStatsSO
        where TRuntime : EntityStatsRuntime
    {
        public abstract TStats BaseStats { get; protected set; }
        public abstract TRuntime RuntimeStats { get; protected set; }
        public InputSystem_Actions InputActions { get; private set; }

        private MaterialPropertyHit _materialPropertyHit;
        private bool _isDead = false;

        public bool IsInvincible { get; private set; } = false;

        public virtual void Init()
        {
            InputActions = new InputSystem_Actions();
            _materialPropertyHit = GetComponentInChildren<MaterialPropertyHit>();
        }

        protected override void Awake()
        {
            InputActions = new InputSystem_Actions();
            Init();
        }

        public override void TakeDamage(int damage)
        {
            if (_isDead || IsInvincible) return;
            if (_isDead) return;
            RuntimeStats.CurrentHealth -= damage;

            _materialPropertyHit?.TriggerHitFlash();
            UIManager.Instance.UIHealthBar(RuntimeStats.CurrentHealth);

            if (RuntimeStats.CurrentHealth <= 0)
                Die();

            Debug.Log($"Player took {damage} damage. Current health: {RuntimeStats.CurrentHealth}");
        }

        public override void Die()
        {
            gameObject.SetActive(false);
            Vector3 spawnPosition = transform.position + Vector3.up * 6f;
            Instantiate(BaseStats.DieVFX, spawnPosition, Quaternion.identity);
            _isDead = true;

            UIManager.Instance.ShowDieUI(true);
            UIManager.Instance.UIHealthBar(0);
            UIManager.Instance.UpdateCuteNukeCharge(0f);
        }

        public void Flip(Transform body, float inputX)
        {
            if (Mathf.Approximately(inputX, 0f)) return;

            Vector3 scale = body.localScale;
            scale.x = Mathf.Sign(inputX) * Mathf.Abs(scale.x);
            body.localScale = scale;
        }

        public void SetInvincible(float duration)
        {
            if (gameObject.activeInHierarchy)
                StartCoroutine(InvincibilityRoutine(duration));
        }

        private IEnumerator InvincibilityRoutine(float duration)
        {
            IsInvincible = true;
            yield return new WaitForSeconds(duration);
            IsInvincible = false;
        }

    }
}
