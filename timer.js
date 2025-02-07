let targetDate = null;
let countdownTimer = null;
let remainingTime = 0; 

function getTimeSegmentElements(segmentElement) {
  const flipElement = segmentElement.querySelector('.flip');
  return {
    topElement: flipElement.querySelector('.top'),
    bottomElement: flipElement.querySelector('.bottom'),
    effectElement: flipElement.querySelector('.effect'),
    effectTopElement: flipElement.querySelector('.effect_top'),
    effectBottomElement: flipElement.querySelector('.effect_bottom'),
  };
}

function updateSegmentValues(displayElement, overlayElement, value) {
  displayElement.textContent = value;
  overlayElement.textContent = value;
}

function updateTimeSegment(segmentElement, timeValue) {
    const segmentElements = getTimeSegmentElements(segmentElement);
    const currentValue = parseInt(segmentElements.topElement.textContent, 10);

    if (currentValue === timeValue) return; // Skip if no change

    segmentElements.effectElement.classList.add('flip');

    updateSegmentValues(segmentElements.topElement, segmentElements.effectBottomElement, timeValue);

    function finishAnimation() {
        segmentElements.effectElement.classList.remove('flip');
        updateSegmentValues(segmentElements.bottomElement, segmentElements.effectTopElement, timeValue);
        this.removeEventListener('animationend', finishAnimation);
    }

    segmentElements.effectElement.addEventListener('animationend', finishAnimation);
}

function updateTimeSection(sectionID, timeValue) {
  const firstNumber = Math.floor(timeValue / 10) || 0;
  const secondNumber = timeValue % 10 || 0;
  const sectionElement = document.getElementById(sectionID);
  const timeSegments = sectionElement.querySelectorAll('.single');

  updateTimeSegment(timeSegments[0], firstNumber);
  updateTimeSegment(timeSegments[1], secondNumber);
}

function getTimeRemaining() {
  if (!targetDate) return { complete: true, hours: 0, minutes: 0, seconds: 0 };

  const nowTime = Date.now();
  const remaining = Math.max(0, targetDate - nowTime);
  return {
    complete: remaining === 0,
    hours: Math.floor(remaining / 3600000),
    minutes: Math.floor(remaining / 60000) % 60,
    seconds: Math.floor(remaining / 1000) % 60,
  };
}

function updateAllSegments() {
  const timeRemainingBits = getTimeRemaining();

  updateTimeSection('hours', timeRemainingBits.hours);
  updateTimeSection('minutes', timeRemainingBits.minutes);
  updateTimeSection('seconds', timeRemainingBits.seconds);

  if (timeRemainingBits.complete) {
      const alarm = document.getElementById('alarmSound');

      if (alarm.paused) { 
          alarm.play();
      }

      setTimeout(() => {
          alert("⏰ Time is up! click the stop button to pause the alarm");
      }, 100); 

      return true;
  }

  return false;
}

function startCountdown() {
  if (countdownTimer) cancelAnimationFrame(countdownTimer);

  if (remainingTime > 0) {
    targetDate = new Date(Date.now() + remainingTime);
    remainingTime = 0;
  } else {
    const inputHours = parseInt(document.getElementById('ipHours').value, 10) || 0;
    const inputMinutes = parseInt(document.getElementById('ipMinutes').value, 10) || 0;
    const inputSeconds = parseInt(document.getElementById('ipSeconds').value, 10) || 0;

    originalTime = (inputHours * 3600 + inputMinutes * 60 + inputSeconds) * 1000; 

    targetDate = new Date(Date.now() + originalTime);
  }

  function update() {
    if (updateAllSegments()) return;
    countdownTimer = requestAnimationFrame(update);
  }

  update();
}

function stopCountdown() {
  clearInterval(countdownTimer);
  cancelAnimationFrame(countdownTimer);

  if (targetDate) {
      remainingTime = Math.max(0, targetDate - Date.now());
  }

  targetDate = null;

 
  const alarm = document.getElementById('alarmSound');
  alarm.pause();
  alarm.currentTime = 0;
}

function resetCountdown() {
  stopCountdown();
  targetDate = null;
  remainingTime = 0;

  const hours = Math.floor(originalTime / 3600000);
  const minutes = Math.floor((originalTime % 3600000) / 60000);
  const seconds = Math.floor((originalTime % 60000) / 1000);

  document.getElementById('ipHours').value = hours;
  document.getElementById('ipMinutes').value = minutes;
  document.getElementById('ipSeconds').value = seconds;

  updateTimeSection('hours', hours);
  updateTimeSection('minutes', minutes);
  updateTimeSection('seconds', seconds);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('startTimer').addEventListener('click', startCountdown);
  document.getElementById('stopTimer').addEventListener('click', stopCountdown);
  document.getElementById('resetTimer').addEventListener('click', resetCountdown);
});
