using UnityEngine;

namespace Game.Data
{
    [CreateAssetMenu(fileName = "HueMatchSettings", menuName = "Game/Data/Hue Match Settings")]
    public class HueMatchSettings : ScriptableObject
    {
        [Header("Tolerance Settings")]
        [SerializeField] private int PerfectTolerance = 6;
        [SerializeField] private int GreatTolerance = 12;
        [SerializeField] private int GoodTolerance = 25;

        [field: Header("Visual Feedback Colors")]
        [field: SerializeField] public Color StartingColor { get; private set; } = Color.white;
        [field: SerializeField] public Color FailedColor { get; private set; } = Color.black;

        public ColorDifficulty GetHueMatchRating(float targetHue, float currentHue)
        {
            int diff = GetHueDifference(targetHue * 360f, currentHue * 360f);

            if (diff <= PerfectTolerance) return ColorDifficulty.Perfect;
            if (diff <= GreatTolerance) return ColorDifficulty.Great;
            if (diff <= GoodTolerance) return ColorDifficulty.Good;

            return ColorDifficulty.Miss;
        }

        public int GetHueDifference(float a, float b)
        {
            float diff = Mathf.Abs(a - b) % 360f;
            return Mathf.RoundToInt(diff > 180f ? 360f - diff : diff);
        }

        public Color GetCyclingColor(float t)
        {
            float hue = Mathf.Repeat(t, 1f);
            return Color.HSVToRGB(hue, 1f, 0.3f);
        }

        public Color GetRandomHueColor()
        {
            float hue = Random.Range(0f, 1f);
            return Color.HSVToRGB(hue, 1f, 1f);
        }
    }
}
