function getDebugValue(id, fallback) {
  var el = document.getElementById(id);
  var val = parseFloat(el.value);
  if (isNaN(val)) return fallback;
  return val;
}

function delay(baseMs, randomMs) {
  var time = baseMs + Math.random() * randomMs;
  return new Promise(function(resolve) {
    setTimeout(resolve, time);
  });
}

function createPet() {
  var hunger = 70;
  var happiness = 70;
  var energy = 70;
  var alive = true;

  function getStats() {
    return { hunger: hunger, happiness: happiness, energy: energy, alive: alive };
  }

  function feed(amount) {
    if (hunger + amount > 100) {
      return Promise.reject("Питомец не хочет есть — он уже сыт!");
    }
    hunger = hunger + amount;
    return Promise.resolve();
  }

  function play(happyAmount, energyCost) {
    if (happiness + happyAmount > 100) {
      return Promise.reject("Питомец не хочет играть — он уже счастлив!");
    }
    happiness = happiness + happyAmount;
    energy = energy - energyCost;
    if (energy < 0) energy = 0;
    return Promise.resolve();
  }

  function sleep() {
    if (energy >= 100) {
      return Promise.reject("Питомец не хочет спать — он полон сил!");
    }
    energy = 100;
    return Promise.resolve();
  }

  function decay() {
    if (!alive) return;
    hunger = hunger - 3;
    happiness = happiness - 2;
    energy = energy - 2;
    if (hunger < 0) hunger = 0;
    if (happiness < 0) happiness = 0;
    if (energy < 0) energy = 0;
    if (hunger === 0 || happiness === 0 || energy === 0) {
      alive = false;
    }
  }

  function loseHappiness(amount) {
    happiness = happiness - amount;
    if (happiness < 0) happiness = 0;
    if (happiness === 0) alive = false;
  }

  function reset() {
    hunger = 70;
    happiness = 70;
    energy = 70;
    alive = true;
  }

  return {
    getStats: getStats,
    feed: feed,
    play: play,
    sleep: sleep,
    decay: decay,
    loseHappiness: loseHappiness,
    reset: reset
  };
}

var pet = createPet();

var actionRunning = false;

var decayInterval = null;
var wanderInterval = null;

var wanderResolve = null;
var wanderActive = false;

function render() {
  var s = pet.getStats();

  document.getElementById("barHunger").style.width = s.hunger + "%";
  document.getElementById("valHunger").textContent = Math.round(s.hunger);

  document.getElementById("barHappiness").style.width = s.happiness + "%";
  document.getElementById("valHappiness").textContent = Math.round(s.happiness);

  document.getElementById("barEnergy").style.width = s.energy + "%";
  document.getElementById("valEnergy").textContent = Math.round(s.energy);

  if (!s.alive) {
    document.getElementById("petFace").textContent = "💀";
    showStatus("Питомец ушёл... Начните заново.", true);
    setButtonsDisabled(true);
    document.getElementById("btnRestart").classList.add("visible");
    return;
  }

  if (s.hunger < 20 || s.happiness < 20 || s.energy < 20) {
    document.getElementById("petFace").textContent = "😰";
  } else if (s.hunger > 70 && s.happiness > 70 && s.energy > 70) {
    document.getElementById("petFace").textContent = "😄";
  } else {
    document.getElementById("petFace").textContent = "🐣";
  }
}

function showStatus(text, isError) {
  var el = document.getElementById("statusMsg");
  el.textContent = text;
  if (isError) {
    el.className = "status-msg error";
  } else {
    el.className = "status-msg";
  }
}

function shakePet() {
  var face = document.getElementById("petFace");
  face.classList.remove("shake");
  void face.offsetWidth;
  face.classList.add("shake");
}

function setButtonsDisabled(disabled) {
  document.getElementById("btnFeed").disabled = disabled;
  document.getElementById("btnPlay").disabled = disabled;
  document.getElementById("btnSleep").disabled = disabled;
  document.getElementById("btnTrain").disabled = disabled;
}

function runAction(actionFn, label) {
  if (actionRunning) {
    showStatus("Питомец занят!", true);
    return;
  }
  if (!pet.getStats().alive) return;

  actionRunning = true;
  setButtonsDisabled(true);
  showStatus(label + "...");

  var dur = getDebugValue("dbgDuration", 3000);
  var rnd = getDebugValue("dbgRandom", 1000);

  delay(dur, rnd)
    .then(actionFn)
    .then(function() {
      showStatus(label + " — готово!");
      render();
    })
    .catch(function(reason) {
      shakePet();
      showStatus(reason, true);
    })
    .finally(function() {
      actionRunning = false;
      if (pet.getStats().alive) {
        setButtonsDisabled(false);
      }
    });
}

function handleFeed() {
  var amount = getDebugValue("dbgFeedAmount", 30);
  runAction(function() {
    return pet.feed(amount);
  }, "Кормление");
}

function handlePlay() {
  var happy = getDebugValue("dbgHappyAmount", 25);
  var energy = getDebugValue("dbgEnergyPlayAmount", 15);
  runAction(function() {
    return pet.play(happy, energy);
  }, "Игра");
}

function handleSleep() {
  runAction(function() {
    return pet.sleep();
  }, "Сон");
}

function handleTrain() {
  if (actionRunning) {
    showStatus("Питомец занят!", true);
    return;
  }
  if (!pet.getStats().alive) return;

  actionRunning = true;
  setButtonsDisabled(true);
  showStatus("Дрессировка...");

  var dur = getDebugValue("dbgDuration", 3000);
  var rnd = getDebugValue("dbgRandom", 1000);
  var feedAmount = getDebugValue("dbgFeedAmount", 30);
  var happyAmount = getDebugValue("dbgHappyAmount", 25);
  var energyCost = getDebugValue("dbgEnergyPlayAmount", 15);

  var feedPromise = delay(dur, rnd).then(function() {
    return pet.feed(feedAmount);
  });

  var playPromise = delay(dur, rnd).then(function() {
    return pet.play(happyAmount, energyCost);
  });

  Promise.all([feedPromise, playPromise])
    .then(function() {
      showStatus("Дрессировка завершена!");
      render();
    })
    .catch(function(reason) {
      shakePet();
      showStatus(reason, true);
    })
    .finally(function() {
      actionRunning = false;
      if (pet.getStats().alive) {
        setButtonsDisabled(false);
      }
    });
}

function startWandering() {
  if (!pet.getStats().alive) return;
  if (wanderActive) return;

  wanderActive = true;

  var wanderTime = getDebugValue("dbgWanderTime", 3000);
  var wanderMsg = document.getElementById("wanderMsg");
  var btnCatch = document.getElementById("btnCatch");

  wanderMsg.textContent = "⚠️ Питомец убегает! Поймайте его!";
  btnCatch.classList.add("visible");

  var timerPromise = new Promise(function(_, reject) {
    setTimeout(function() {
      reject("убежал");
    }, wanderTime);
  });

  var catchPromise = new Promise(function(resolve) {
    wanderResolve = resolve;
  });

  Promise.race([timerPromise, catchPromise])
    .then(function() {
      wanderMsg.textContent = "✅ Питомец пойман!";
    })
    .catch(function() {
      wanderMsg.textContent = "😢 Питомец убежал и расстроился...";
      pet.loseHappiness(20);
      render();
    })
    .finally(function() {
      wanderActive = false;
      wanderResolve = null;
      btnCatch.classList.remove("visible");
      setTimeout(function() {
        wanderMsg.textContent = "";
      }, 2000);
    });
}

function handleCatch() {
  if (wanderResolve !== null) {
    wanderResolve();
  }
}

function startTimers() {
  if (decayInterval !== null) clearInterval(decayInterval);
  if (wanderInterval !== null) clearInterval(wanderInterval);

  var decaySec = getDebugValue("dbgDecayInterval", 5) * 1000;
  var wanderSec = getDebugValue("dbgWanderInterval", 15) * 1000;

  decayInterval = setInterval(function() {
    if (!pet.getStats().alive) {
      clearInterval(decayInterval);
      clearInterval(wanderInterval);
      return;
    }
    pet.decay();
    render();
  }, decaySec);

  wanderInterval = setInterval(function() {
    if (!pet.getStats().alive) {
      clearInterval(wanderInterval);
      return;
    }
    startWandering();
  }, wanderSec);
}

function handleRestart() {
  pet.reset();
  actionRunning = false;
  wanderActive = false;
  wanderResolve = null;
  document.getElementById("btnCatch").classList.remove("visible");
  document.getElementById("btnRestart").classList.remove("visible");
  document.getElementById("wanderMsg").textContent = "";
  showStatus("Игра началась!");
  setButtonsDisabled(false);
  render();
  startTimers();
}

function toggleDebug() {
  document.getElementById("debugPanel").classList.toggle("open");
}

render();
startTimers();
showStatus("Ухаживайте за питомцем!");
