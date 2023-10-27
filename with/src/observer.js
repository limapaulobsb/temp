export function buildThresholdList(numSteps) {
  const thresholds = [];
  const step = 1 / numSteps;

  for (let i = 0; i <= 1; i += step) {
    thresholds.push(i.toPrecision(2));
  }

  return thresholds;
}

export default function createObserver(handleIntersect, margin = 0, threshold = 0) {
  const options = {
    root: document.getElementById('#infinite-scroll'),
    rootMargin: margin,
    threshold,
  };

  return new IntersectionObserver(handleIntersect, options);
}
