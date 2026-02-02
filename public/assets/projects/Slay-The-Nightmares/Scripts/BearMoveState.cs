using Game.Enemy;
using Game.Entity.Player;
using System.Collections;
using UnityEngine;

public class BearMoveState : StateMachine.State
{
    private Bear _bear;
    private bool _canMove = true;

    public BearMoveState(Bear bear) : base(bear) =>
        _bear = bear;

    public override void Enter()
    {
        base.Enter();
        _bear.StartCoroutine(ObserveRoutine());
    }

    public override void FixedUpdate()
    {
        base.FixedUpdate();

        if (_canMove)
        {
            Vector3 fromPos = _bear.transform.position;
            Vector3 toPos = _bear.Player.position;

            Vector3 direction = EnemyAvoidanceHelper.GetAvoidanceAdjustedDirection(
                fromPos,
                toPos,
                20f,
                5f,
                LayerMask.GetMask("Enemy")
            );

            _bear.Flip();
            _bear.transform.position += direction * _bear.BaseStats.MaxMoveSpeed * Time.fixedDeltaTime;
        }
    }

    private IEnumerator ObserveRoutine()
    {
        while (true)
        {
            while (Vector3.Distance(_bear.transform.position, _bear.Player.position) > _bear.BaseStats.AttackRange)
            {
                _bear.Animator.SetBool("IsMove", true);
                yield return null;
            }

            _canMove = false;
            _bear.Animator.SetBool("IsMove", false);
            _bear.Animator.SetTrigger("IsAttack");

            yield return new WaitForSeconds(_bear.BaseStats.AttackCooldown);

            _canMove = true;

            yield return null;
        }
    }
}
