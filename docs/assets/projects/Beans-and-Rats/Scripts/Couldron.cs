using System;
using System.Collections;

using UnityEngine;
using UnityEngine.UIElements.Experimental;

using Game.Data;
using Game.Managers;
using Game.Potions;

namespace Game.Couldron
{
    public class Cauldron : MonoBehaviour, IPotionReceiver
    {
        [Header("Data Reference")]
        [SerializeField] private PotionRecipeManager _potionRecipeManager;
        [SerializeField] private HueMatchSettings _hueMatchSettings;
        [SerializeField] private LeverController _leverController;
        [SerializeField] private SpoonController _spoonController;

        [Header("Visuals")]
        [SerializeField] private Renderer _liquidRenderer;
        [SerializeField] private float _hueChangeMultiplier = 0.1f;
        [SerializeField] private ParticleSystem _poofFX;

        private static readonly int BaseColorID = Shader.PropertyToID("_Base_Color");

        private MaterialPropertyBlock _propertyBlock;
        private Color _currentColor;
        private float _hueT = 0f;

        private Coroutine _pourCheckCoroutine;
        private Ingradient _lastValidIngredient;

        private Coroutine _leverCheckCoroutine;

        private int _totalSteps = 0;
        private int _currentScore = 0;
        private const int MaxScore = 10;

        public event Action<Color> OnColorUpdated;
        public event Action OnIncorrectIngredient;
        public event Action<ColorDifficulty, string> OnColorRatingEvaluated;

        private void Awake()
        {
            Color.RGBToHSV(_hueMatchSettings.StartingColor, out _hueT, out _, out _);
            _currentColor = _hueMatchSettings.GetCyclingColor(_hueT);

            _propertyBlock = new MaterialPropertyBlock();
            UpdateLiquidColor(_currentColor);
        }

        private void Start()
        {
            InitRecipeData();
        }

        private void OnEnable()
        {
            _leverController.OnGearChanged += HandleLeverGearChanged;
            _spoonController.OnStir += HandleStirHueChange;
            _spoonController.OnStirConfirmed += HandleStirConfirmed;
        }

        private void OnDisable()
        {
            _leverController.OnGearChanged -= HandleLeverGearChanged;
            _spoonController.OnStir -= HandleStirHueChange;
            _spoonController.OnStirConfirmed -= HandleStirConfirmed;
        }

        public void OnPotionHit(Ingradient ingredient)
        {
            var currentStep = _potionRecipeManager.GetCurrentStep();

            if (currentStep.StepType != PotionDefinitions.PotionStepType.AddIngredient)
            {
                HandleIncorrectIngredient();
                return;
            }

            if (!IsIngredientValid(ingredient))
            {
                HandleIncorrectIngredient();
                return;
            }

            _lastValidIngredient = ingredient;
            UpdateHueAndColor(ingredient);
            StartPourCheck();
        }

        private bool IsIngredientValid(Ingradient ingredient)
        {
            var currentStep = _potionRecipeManager.GetCurrentStep();
            return currentStep.StepType != PotionDefinitions.PotionStepType.AddIngredient
                   || ingredient.IngradientStatsRuntime.ID == currentStep.Ingredient;
        }

        private void UpdateHueAndColor(Ingradient ingredient)
        {
            int hueChange = ingredient.IngradientStatsRuntime.VolumePerParticle;
            _hueT += (hueChange / 360f) * _hueChangeMultiplier;

            var newColor = _hueMatchSettings.GetCyclingColor(_hueT);
            if (newColor != _currentColor)
            {
                _currentColor = newColor;
                UpdateLiquidColor(_currentColor);
                OnColorUpdated?.Invoke(_currentColor);
            }
        }

        private void StartPourCheck()
        {
            if (_pourCheckCoroutine != null)
                StopCoroutine(_pourCheckCoroutine);
            _pourCheckCoroutine = StartCoroutine(CheckPourEnd());
        }

        private IEnumerator CheckPourEnd()
        {
            yield return new WaitForSeconds(3f);
            VerifyStep(_lastValidIngredient);
        }

        private void VerifyStep(Ingradient ingredient)
        {
            var currentStep = _potionRecipeManager.GetCurrentStep();
            switch (currentStep.StepType)
            {
                case PotionDefinitions.PotionStepType.AddIngredient:
                    HandleAddIngredient(ingredient, currentStep);
                    break;
                case PotionDefinitions.PotionStepType.Heat:
                    break;
                default:
                    break;
            }
        }

        private void HandleAddIngredient(Ingradient ingredient, PotionCraftingRecipeSO.RecipeStep step)
        {
            Color.RGBToHSV(step.ResultColor, out float targetHue, out _, out _);
            targetHue = Mathf.Round(targetHue * 360f) / 360f;

            var rating = _hueMatchSettings.GetHueMatchRating(targetHue, _hueT);
            OnColorRatingEvaluated?.Invoke(rating, null);
            AddScoreFromRating(rating);

            bool wasLastStep = _potionRecipeManager.IsLastStep();
            _potionRecipeManager.AdvanceToNextStep();

            if (wasLastStep)
                FinalStepVerification();
        }

        private void HandleIncorrectIngredient()
        {
            OnIncorrectIngredient?.Invoke();
        }

        private void HandleLeverGearChanged(int newGear)
        {
            var currentStep = _potionRecipeManager.GetCurrentStep();

            if (currentStep.StepType != PotionDefinitions.PotionStepType.Heat)
            {
                HandleIncorrectIngredient();
                return;
            }

            if (_leverCheckCoroutine != null)
                StopCoroutine(_leverCheckCoroutine);

            _leverCheckCoroutine = StartCoroutine(CheckLeverGear());
        }

        private IEnumerator CheckLeverGear()
        {
            yield return new WaitForSeconds(3f);

            var currentStep = _potionRecipeManager.GetCurrentStep();
            int expectedGear = currentStep.RequiredHeats - 1;
            int currentGear = _leverController.CurrentGear;
            var rating = GetLeverRating(expectedGear, currentGear);

            OnColorRatingEvaluated?.Invoke(rating, null);
            AddScoreFromRating(rating);

            bool wasLastStep = _potionRecipeManager.IsLastStep();
            _potionRecipeManager.AdvanceToNextStep();

            if (wasLastStep)
                FinalStepVerification();
        }

        private ColorDifficulty GetLeverRating(int expected, int actual)
        {
            return expected == actual ? ColorDifficulty.Perfect : ColorDifficulty.Miss;
        }

        private void HandleStirHueChange(float hueDelta)
        {
            var step = _potionRecipeManager.GetCurrentStep();
            if (step.StepType != PotionDefinitions.PotionStepType.Mix)
                return;

            _hueT += hueDelta * _hueChangeMultiplier;
            var newColor = _hueMatchSettings.GetCyclingColor(_hueT);
            if (newColor != _currentColor)
            {
                _currentColor = newColor;
                UpdateLiquidColor(_currentColor);
                OnColorUpdated?.Invoke(_currentColor);
            }
        }

        private void HandleStirConfirmed()
        {
            var step = _potionRecipeManager.GetCurrentStep();

            if (step.StepType != PotionDefinitions.PotionStepType.Mix)
            {
                HandleIncorrectIngredient();
                return;
            }

            Color.RGBToHSV(step.ResultColor, out float targetHue, out _, out _);
            targetHue = Mathf.Round(targetHue * 360f) / 360f;
            var rating = _hueMatchSettings.GetHueMatchRating(targetHue, _hueT);

            Debug.Log($"Rating: {rating}");
            OnColorRatingEvaluated?.Invoke(rating, null);
            AddScoreFromRating(rating);

            bool wasLastStep = _potionRecipeManager.IsLastStep();
            _potionRecipeManager.AdvanceToNextStep();

            if (wasLastStep)
                FinalStepVerification();
        }

        private void FinalStepVerification()
        {
            StartCoroutine(DelayedFinalFeedback());
        }

        private IEnumerator DelayedFinalFeedback()
        {
            yield return new WaitForSeconds(6f);

            _poofFX.Play();

            var finalRating = EvaluateScore(_currentScore);
            OnColorRatingEvaluated?.Invoke(finalRating, $"Rate: {_currentScore}/10");

            StartCoroutine(AdvanceToNextRecipe());
        }

        private ColorDifficulty EvaluateScore(float score)
        {
            if (score < 2.5f)
                return ColorDifficulty.Miss;
            else if (score <= 5f)
                return ColorDifficulty.Good;
            else if (score <= 7.5f)
                return ColorDifficulty.Great;
            else
                return ColorDifficulty.Perfect;
        }

        private IEnumerator AdvanceToNextRecipe()
        {
            yield return new WaitForSeconds(3f);

            _potionRecipeManager.AdvanceToNextRecipe();
            InitRecipeData();
        }

        private void InitRecipeData()
        {
            _totalSteps = _potionRecipeManager.GetCurrentRecipe().Steps.Count;
            _currentScore = 0;
        }

        private void AddScoreFromRating(ColorDifficulty rating)
        {
            float stepWeight = MaxScore / (float)_totalSteps;

            switch (rating)
            {
                case ColorDifficulty.Perfect:
                    _currentScore += Mathf.RoundToInt(stepWeight);
                    break;
                case ColorDifficulty.Good:
                    _currentScore += Mathf.RoundToInt(stepWeight * 0.7f);
                    break;
                case ColorDifficulty.Miss:
                    _currentScore += 0;
                    break;
            }

            _currentScore = Mathf.Min(_currentScore, MaxScore);
        }

        private void UpdateLiquidColor(Color color)
        {
            _propertyBlock.SetColor(BaseColorID, color);
            _liquidRenderer.SetPropertyBlock(_propertyBlock);
        }
    }
}
