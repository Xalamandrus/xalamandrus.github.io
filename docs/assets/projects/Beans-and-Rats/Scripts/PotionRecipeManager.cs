using UnityEngine;
using Game.Potions;

namespace Game.Managers
{
    public class PotionRecipeManager : MonoBehaviour
    {
        [Header("Recipe Data")]
        [SerializeField] private PotionRecipeSequenceSO _recipeSequenceSO;

        private PotionCraftingRecipeSO _currentRecipe;
        private int _currentRecipeIndex = 0;
        private int _currentStep = 0;

        private void Awake()
        {
            _currentRecipe = _recipeSequenceSO.RecipeSequence[_currentRecipeIndex];
        }

        public void AdvanceToNextRecipe()
        {
            _currentRecipeIndex++;

            if (_currentRecipeIndex >= _recipeSequenceSO.RecipeSequence.Count)
            {
                Debug.Log("All recipes completed!");
                return;
            }

            _currentRecipe = _recipeSequenceSO.RecipeSequence[_currentRecipeIndex];
            _currentStep = 0;
        }

        public void AdvanceToNextStep()
        {
            _currentStep++;

            Debug.Log($"Advancing to next step: {_currentStep}");
        }

        public PotionCraftingRecipeSO.RecipeStep GetCurrentStep()
        {
            if (_currentRecipe == null || _currentStep >= _currentRecipe.Steps.Count)
            {
                Debug.LogWarning("GetCurrentStep() called but no valid recipe step available.");
                return null;
            }

            return _currentRecipe.Steps[_currentStep];
        }

        public bool IsLastIgradient()
        {
            return _currentStep >= _currentRecipe.Steps.Count;
        }

        public bool IsLastStep()
        {
            return _currentStep == _currentRecipe.Steps.Count - 1;
        }

        public PotionCraftingRecipeSO GetCurrentRecipe()
        {
            return _currentRecipe;
        }
    }
}
