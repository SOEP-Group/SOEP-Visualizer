export function initializeScrollButtons(
  tabsContainer,
  scrollLeftButton,
  scrollRightButton
) {
  const updateScrollButtons = () => {
    const isAtStart = tabsContainer.scrollLeft <= 0;
    const isAtEnd =
      Math.ceil(tabsContainer.scrollLeft + tabsContainer.clientWidth) >=
      tabsContainer.scrollWidth - 1;

    const isScrollable = tabsContainer.scrollWidth > tabsContainer.clientWidth;

    if (isScrollable) {
      scrollLeftButton.classList.toggle("hidden", isAtStart);
      scrollRightButton.classList.toggle("hidden", isAtEnd);
    } else {
      scrollLeftButton.classList.add("hidden");
      scrollRightButton.classList.add("hidden");
    }
  };

  scrollLeftButton.classList.add("hidden");

  scrollRightButton.addEventListener("click", () => {
    const maxScrollLeft = tabsContainer.scrollWidth - tabsContainer.clientWidth;
    const distanceToRight = maxScrollLeft - tabsContainer.scrollLeft;
    const scrollAmount = Math.min(200, distanceToRight);

    tabsContainer.scrollBy({ left: scrollAmount, behavior: "smooth" });
  });

  scrollLeftButton.addEventListener("click", () => {
    const distanceToLeft = tabsContainer.scrollLeft;
    const scrollAmount = Math.min(200, distanceToLeft);

    tabsContainer.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  });

  tabsContainer.addEventListener("scroll", updateScrollButtons);
  window.addEventListener("resize", updateScrollButtons);

  updateScrollButtons();
}
