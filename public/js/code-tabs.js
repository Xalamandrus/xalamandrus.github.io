(() => {
    const tabButtons = document.querySelectorAll('.code-tab');
    const tabPanels = document.querySelectorAll('.code-panel');

    if (tabButtons.length === 0 || tabPanels.length === 0) return;

    const switchTab = (targetTab) => {
        // Dezaktywuj wszystkie taby
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });

        // Ukryj wszystkie panele bez animacji
        tabPanels.forEach(panel => {
            panel.classList.remove('active');
        });

        // Małe opóźnienie dla płynnego przejścia
        setTimeout(() => {
            // Aktywuj wybrany tab i panel
            const activeButton = document.querySelector(`[data-tab="${targetTab}"]`);
            const activePanel = document.querySelector(`[data-panel="${targetTab}"]`);

            if (activeButton && activePanel) {
                activeButton.classList.add('active');
                activeButton.setAttribute('aria-selected', 'true');
                
                // Wymuś reflow aby animacja zadziałała
                void activePanel.offsetWidth;
                activePanel.classList.add('active');
            }
        }, 50);
    };

    // Dodaj event listenery do wszystkich tabów
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            if (targetTab) {
                switchTab(targetTab);
            }
        });

        // Obsługa klawiatury dla dostępności
        button.addEventListener('keydown', (e) => {
            const currentIndex = Array.from(tabButtons).indexOf(button);
            let nextIndex;

            if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextIndex = (currentIndex + 1) % tabButtons.length;
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
            } else {
                return;
            }

            const nextButton = tabButtons[nextIndex];
            nextButton.focus();
            switchTab(nextButton.dataset.tab);
        });
    });
})();
