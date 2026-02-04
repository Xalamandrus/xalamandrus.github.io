using System;
using TMPro;
using UnityEngine;
using UnityEngine.XR.Interaction.Toolkit;
using UnityEngine.XR.Interaction.Toolkit.Interactables;

public class LeverController : MonoBehaviour
{
    [SerializeField] private TextMeshProUGUI[] gearTexts;
    [SerializeField] private int _gearCount = 5;
    [SerializeField] private bool _isLeverLocked = false;

    private HingeJoint _hingeJoint;
    private XRGrabInteractable _grabInteractable;

    private float[] _gearAngles;
    private int _currentGear;

    private float _minLimit;
    private float _maxLimit;

    public int CurrentGear => _currentGear;

    public event Action<int> OnGearChanged;

    private void Awake()
    {
        _hingeJoint = GetComponent<HingeJoint>();
        _grabInteractable = GetComponent<XRGrabInteractable>();
        _grabInteractable.selectExited.AddListener(OnLeverReleased);

        GenerateGearAngles();
        SetGear(0);
    }

    private void OnDestroy()
    {
        if (_grabInteractable != null)
            _grabInteractable.selectExited.RemoveListener(OnLeverReleased);
    }

    private void GenerateGearAngles()
    {
        JointLimits limits = _hingeJoint.limits;
        _minLimit = limits.min;
        _maxLimit = limits.max;

        if (_gearCount <= 1)
        {
            Debug.LogWarning("Gear count must be at least 2.");
            _gearAngles = new float[] { _minLimit };
            return;
        }

        _gearAngles = new float[_gearCount];
        float step = (_maxLimit - _minLimit) / (_gearCount - 1);

        for (int i = 0; i < _gearCount; i++)
        {
            _gearAngles[i] = _minLimit + step * i;
        }
    }

    private void SetGear(int gearIndex)
    {
        if (_gearAngles == null || _gearAngles.Length == 0) return;

        gearIndex = Mathf.Clamp(gearIndex, 0, _gearAngles.Length - 1);
        _currentGear = gearIndex;

        float angle = _gearAngles[gearIndex];
        transform.localRotation = Quaternion.Euler(angle, 0f, 0f);

        UpdateGearUI(_currentGear);
    }

    private void OnLeverReleased(SelectExitEventArgs args)
    {
        if (_isLeverLocked || _gearAngles == null || _gearAngles.Length == 0)
            return;

        float angle = NormalizeAngle(transform.localEulerAngles.x);
        int closestGear = GetClosestGearIndex(angle);

        SetGear(closestGear);
        OnGearChanged?.Invoke(_currentGear);
    }

    private void Update()
    {
        if (_isLeverLocked || _gearAngles == null || _gearAngles.Length == 0)
            return;

        float angle = NormalizeAngle(transform.localEulerAngles.x);
        int closestGear = GetClosestGearIndex(angle);

        if (closestGear != _currentGear)
        {
            _currentGear = closestGear;
            UpdateGearUI(closestGear);
        }
    }

    private int GetClosestGearIndex(float angle)
    {
        int closestIndex = 0;
        float smallestDifference = Mathf.Abs(angle - _gearAngles[0]);

        for (int i = 1; i < _gearAngles.Length; i++)
        {
            float diff = Mathf.Abs(angle - _gearAngles[i]);
            if (diff < smallestDifference)
            {
                smallestDifference = diff;
                closestIndex = i;
            }
        }

        return closestIndex;
    }

    private float NormalizeAngle(float angle)
    {
        if (angle > 180f)
            angle -= 360f;
        return angle;
    }

    private void UpdateGearUI(int activeGear)
    {
        for (int i = 0; i < gearTexts.Length; i++)
        {
            if (gearTexts[i] != null)
                gearTexts[i].color = (i == activeGear) ? Color.white : Color.gray;
        }
    }
}
