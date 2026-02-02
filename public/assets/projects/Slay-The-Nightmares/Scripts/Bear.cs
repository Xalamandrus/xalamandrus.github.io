using Game.Entity.Stats;
using UnityEngine;

namespace Game.Enemy
{
    public class Bear : EnemyBase<BearStatsSO, EnemyStatsRuntime>
    {
        [field: Header("Bear Stats")]
        [field: SerializeField] public override BearStatsSO BaseStats { get; protected set; }
        public override EnemyStatsRuntime RuntimeStats { get; protected set; }

        public override void Init(Transform player)
        {
            base.Init(player);
            RuntimeStats = new EnemyStatsRuntime(BaseStats);
        }

        public override void Activate()
        {
            base.Activate();
            Begin(new BearMoveState(this));
        }

        private void OnDrawGizmos()
        {
            Gizmos.color = Color.red;
            Gizmos.DrawWireSphere(transform.position, BaseStats.AttackRange);
        }
    }
}
