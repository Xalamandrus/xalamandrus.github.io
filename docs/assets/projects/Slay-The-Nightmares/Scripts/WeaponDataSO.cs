using System;
using Game.Enums;
using UnityEngine;
using UnityEngine.Video;

namespace Game.Weapons
{
    [CreateAssetMenu(fileName = "NewWeaponDataSO", menuName = "Game/Data/Weapon/WeaponDataSO")]
    public class WeaponDataSO : ScriptableObject
    {
        [field: Header("Identification")]
        [field: SerializeField] public string WeaponName { get; private set; }
        [field: SerializeField] public WeaponType WeaponType { get; private set; }
        [field: SerializeField] public WeaponStatsSO WeaponStats { get; private set; }

        [field: Header("Visuals")]
        [field: SerializeField] public Sprite WeaponIcon { get; private set; }
        [field: SerializeField] public WeaponEffect[] WeaponAttackEffects { get; private set; }
        [field: SerializeField] public AudioClip AttackSound { get; private set; }

        [field: Header("UI Info")]
        [field: SerializeField, TextArea] public string Description { get; private set; }
        [field: SerializeField] public VideoClip VideoClip { get; private set; }
    }

    [Serializable]
    public struct WeaponEffect
    {
        [field: SerializeField] public GameObject Effect { get; private set; }
        [field: SerializeField] public Vector3 Offset { get; private set; }
        [field: SerializeField] public float Lifetime { get; private set; }
        [field: SerializeField] public bool DestroyManually { get; private set; }
    }
}
