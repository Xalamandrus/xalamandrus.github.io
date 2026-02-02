using System;
using Game.Effects;
using Game.Entity;
using Game.Entity.Player;
using Game.Entity.Stats;
using UnityEngine;

namespace Game.Enemy
{
    public abstract class EnemyBase<TStats, TRuntime> : EntityBase, IEnemy
        where TStats : EntityStatsSO
        where TRuntime : EntityStatsRuntime
    {
        public abstract TStats BaseStats { get; protected set; }
        public abstract TRuntime RuntimeStats { get; protected set; }
        public Transform Player { get; set; }
        public Animator Animator { get; private set; }

        [SerializeField] private GameObject _dreamyPrefab;

        public bool IsAlive => RuntimeStats.CurrentHealth > 0;
        private MaterialPropertyHit _materialPropertyHit;
        private bool _initialized = false;

        public bool WasDamagedDuringAttack { get; set; }
        public event Action<IEnemy> OnDeath;

        #region Initialization

        public virtual void Init(Transform player)
        {
            if (_initialized) return;
            if (player == null)
            {
                Debug.LogWarning($"{gameObject.name}: Cannot Init without player reference.");
                return;
            }

            Player = player;
            Animator = GetComponentInChildren<Animator>();
            _materialPropertyHit = GetComponentInChildren<MaterialPropertyHit>();
            _initialized = true;
        }

        public virtual void Activate()
        {
            gameObject.SetActive(true);
            ResetStats();

            if (Animator != null)
            {
                Animator.Rebind();
                Animator.Update(0f);
            }

            foreach (var renderer in GetComponentsInChildren<SpriteRenderer>(true))
            {
                renderer.enabled = true;
            }
        }

        public void ResetStats()
        {
            RuntimeStats.CurrentHealth = BaseStats.MaxHealth;
            RuntimeStats.MaxMoveSpeed = BaseStats.MaxMoveSpeed;
        }

        #endregion

        #region Combat

        public override void ChangeFormToDreamy()
        {
            Vector3 spawnPos = transform.position;
            Quaternion spawnRot = transform.rotation;
            Transform parent = transform.parent;

            OnDeath?.Invoke(this);

            if (TryGetComponent<TriggerOnDeadEvent>(out var triggerEvent))
                triggerEvent.TriggerNow();

            GameObject dreamy = Instantiate(_dreamyPrefab, spawnPos, spawnRot, parent);

            var dreamyEnemy = dreamy.GetComponent<EnemyBase<EntityStatsSO, EntityStatsRuntime>>();
            if (dreamyEnemy != null)
            {
                dreamyEnemy.Init(Player);
                dreamyEnemy.Activate();
            }

            gameObject.SetActive(false);
        }

        public override void TakeDamage(int damage)
        {
            RuntimeStats.CurrentHealth -= damage;

            WasDamagedDuringAttack = true;
            _materialPropertyHit?.TriggerHitFlash();

            if (Player != null)
                if (Player.TryGetComponent(out Player player))
                {
                    player.GainCuteNukeCharge();
                    player.GainNightmareCharge();
                }

            if (RuntimeStats.CurrentHealth <= 0)
            {
                SpawnDeathVFX();
                Die();
            }
        }


        private void SpawnDeathVFX()
        {
            Vector3 spawnPos = transform.position;
            spawnPos.y = 6f;

            Instantiate(BaseStats.DieVFX, spawnPos, Quaternion.identity);
        }

        public override void Die()
        {
            OnDeath?.Invoke(this);

            if (TryGetComponent<TriggerOnDeadEvent>(out var triggerEvent))
                triggerEvent.TriggerNow();

            Begin(new EnemyDieState(this, Animator));
        }

        #endregion

        #region Utility

        public void Flip()
        {
            Vector3 scale = transform.localScale;
            scale.x = (Player.position.x < transform.position.x) ? 1 : -1;
            transform.localScale = scale;
        }

        #endregion
    }
}
