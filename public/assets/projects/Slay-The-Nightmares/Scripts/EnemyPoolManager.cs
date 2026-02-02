using System;
using System.Collections.Generic;
using Game.Entity.Enemy;
using Game.Enums;
using UnityEngine;

namespace Game.Managers.Pooling
{
    public class EnemyPoolManager : ObjectPool
    {
        [SerializeField] private Transform _playerTransform;
        [SerializeField] private EnemyPoolData[] _poolSetup;

        private Dictionary<EnemyType, Queue<GameObject>> _enemyPool = new();

        public override void Awake() => CreatePool();

        public override void CreatePool()
        {
            foreach (var data in _poolSetup)
            {
                var enemyData = data.EnemyData;
                if (enemyData == null || enemyData.NightmarePrefab == null)
                {
                    Debug.LogWarning("[EnemyPoolManager] Skipped null EnemyData or Prefab.");
                    continue;
                }

                var type = enemyData.Type;

                if (!_enemyPool.ContainsKey(type))
                    _enemyPool[type] = new Queue<GameObject>();

                for (int i = 0; i < data.AmountToPool; i++)
                {
                    var obj = Instantiate(enemyData.NightmarePrefab, _poolParent);
                    obj.SetActive(false);

                    if (obj.TryGetComponent(out IEnemy enemy))
                        enemy.Init(_playerTransform);

                    _enemyPool[type].Enqueue(obj);
                }
            }
        }

        public GameObject GetEnemy(EnemyType type)
        {
            if (!_enemyPool.TryGetValue(type, out var pool) || pool.Count == 0)
            {
                Debug.LogWarning($"[EnemyPoolManager] No enemies of type {type} found in pool.");
                return null;
            }

            int count = pool.Count;

            for (int i = 0; i < count; i++)
            {
                var enemy = pool.Dequeue();

                if (!enemy.activeInHierarchy)
                {
                    pool.Enqueue(enemy);
                    return enemy;
                }

                pool.Enqueue(enemy);
            }

            Debug.LogWarning($"[EnemyPoolManager] All enemies of type {type} are currently active.");
            return null;
        }

        public bool TryGetPool(EnemyType type, out Queue<GameObject> pool)
        {
            return _enemyPool.TryGetValue(type, out pool);
        }

        public Dictionary<EnemyType, Queue<GameObject>> GetAllPools()
        {
            return _enemyPool;
        }

    }

    [Serializable]
    public struct EnemyPoolData
    {
        [SerializeField] private EnemyDataSO enemyData;
        [SerializeField, Min(1)] private int amountToPool;

        public readonly EnemyDataSO EnemyData => enemyData;
        public readonly int AmountToPool => amountToPool;
    }
}
