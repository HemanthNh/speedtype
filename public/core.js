(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.TYPING_CORE = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const RIGHT_HAND_KEYS = new Set("yuiophjklnmYUIOPHJKLNM[]{};:'\",./<>?7890-_=+");
  const LEFT_HAND_KEYS = new Set("qwertasdfgzxcvbQWERTASDFGZXCVB123456!@#$%^");
  const TECHNICAL_SYMBOLS = new Set("[]{}();:'\",./<>?-_=+@#$%^&*|\\`");
  const CORE_MODES = ["Python Automation", "Selenium", "JMeter", "Postman"];

  function handOfExpectedChar(ch) {
    if (RIGHT_HAND_KEYS.has(ch)) return "right";
    if (LEFT_HAND_KEYS.has(ch)) return "left";
    return "neutral";
  }

  function classifyMistakes(target, typed) {
    const breakdown = {
      letters: 0,
      numbers: 0,
      spaces: 0,
      punctuation: 0,
      case: 0,
      extra: 0,
      rightHand: 0,
      leftHand: 0,
      neutral: 0,
      keyErrors: {},
      symbolErrors: 0,
      symbolExpected: 0
    };

    let errors = 0;
    for (let i = 0; i < typed.length; i++) {
      const expected = target[i];
      const actual = typed[i];

      if (expected !== undefined && TECHNICAL_SYMBOLS.has(expected)) breakdown.symbolExpected++;
      if (expected === actual) continue;

      errors++;
      if (expected === undefined) {
        breakdown.extra++;
        breakdown.neutral++;
        continue;
      }

      const keyLabel = expected === " " ? "Space" : expected === "\n" ? "Enter" : expected === "\t" ? "Tab" : expected;
      breakdown.keyErrors[keyLabel] = Number(breakdown.keyErrors[keyLabel] || 0) + 1;

      const hand = handOfExpectedChar(expected);
      if (hand === "right") breakdown.rightHand++;
      else if (hand === "left") breakdown.leftHand++;
      else breakdown.neutral++;

      if (TECHNICAL_SYMBOLS.has(expected)) breakdown.symbolErrors++;

      if (expected && actual && expected.toLowerCase() === actual.toLowerCase() && expected !== actual) {
        breakdown.case++;
        continue;
      }
      if (/\d/.test(expected)) breakdown.numbers++;
      else if (/\s/.test(expected)) breakdown.spaces++;
      else if (/[A-Za-z]/.test(expected)) breakdown.letters++;
      else breakdown.punctuation++;
    }

    const symbolAccuracy = breakdown.symbolExpected
      ? Math.max(0, ((breakdown.symbolExpected - breakdown.symbolErrors) / breakdown.symbolExpected) * 100)
      : 100;

    return { errors, breakdown: { ...breakdown, symbolAccuracy: Number(symbolAccuracy.toFixed(1)) } };
  }

  function calculateTypingStats(target, typed, elapsedMs, targetAccuracy, pasteAttempts) {
    const { errors, breakdown } = classifyMistakes(target, typed);
    const accuracy = typed.length ? Math.max(0, ((typed.length - errors) / typed.length) * 100) : 100;
    const minutes = Math.max(Number(elapsedMs || 0) / 60000, 1 / 60);
    const wpm = Math.round((typed.length / 5) / minutes);
    const accuracyPoints = Math.min(70, accuracy * 0.70);
    const speedPoints = accuracy >= 95 ? Math.min(30, wpm * 0.60) : 0;
    const liveScore = Math.round(accuracyPoints + speedPoints);

    return {
      wpm,
      accuracy: Number(accuracy.toFixed(1)),
      errors,
      mistakeBreakdown: { ...breakdown, pasteAttempts: Number(pasteAttempts || 0) },
      liveScore,
      passedAccuracyGate: accuracy >= Number(targetAccuracy || 97)
    };
  }

  function allDrills(drills) {
    const rows = [];
    for (const [mode, levels] of Object.entries(drills || {})) {
      for (const [level, exercises] of Object.entries(levels || {})) {
        for (const exercise of exercises || []) rows.push({ ...exercise, mode, level: Number(level) });
      }
    }
    return rows;
  }

  function levelProgress(drills, exercisesState, mode, level) {
    const arr = drills?.[mode]?.[Number(level)] || [];
    const mastered = arr.filter(d => exercisesState?.[d.id]?.status === "mastered").length;
    const repeats = arr.filter(d => exercisesState?.[d.id]?.status === "repeat").length;
    const inProgress = arr.filter(d => exercisesState?.[d.id]?.status === "in_progress").length;
    return {
      mastered,
      total: arr.length,
      repeats,
      inProgress,
      complete: arr.length > 0 && mastered === arr.length,
      percent: arr.length ? Math.round((mastered / arr.length) * 100) : 0
    };
  }

  function domainProgress(drills, exercisesState, mode) {
    let mastered = 0;
    let total = 0;
    let completedLevels = 0;
    const levels = [];
    for (let level = 1; level <= 4; level++) {
      const p = levelProgress(drills, exercisesState, mode, level);
      mastered += p.mastered;
      total += p.total;
      if (p.complete) completedLevels++;
      levels.push({ level, ...p });
    }
    return {
      mode,
      mastered,
      total,
      completedLevels,
      complete: total > 0 && mastered === total,
      percent: total ? Math.round((mastered / total) * 100) : 0,
      levels
    };
  }

  function progressSummary(drills, exercisesState) {
    const domains = Object.keys(drills || {}).map(mode => domainProgress(drills, exercisesState, mode));
    const overallMastered = domains.reduce((sum, d) => sum + d.mastered, 0);
    const overallTotal = domains.reduce((sum, d) => sum + d.total, 0);
    const coreDomains = domains.filter(d => CORE_MODES.includes(d.mode));
    const coreMastered = coreDomains.reduce((sum, d) => sum + d.mastered, 0);
    const coreTotal = coreDomains.reduce((sum, d) => sum + d.total, 0);
    const completedLevels = domains.reduce((sum, d) => sum + d.completedLevels, 0);
    const totalLevels = domains.length * 4;
    const repeatQueue = allDrills(drills).filter(d => exercisesState?.[d.id]?.status === "repeat");
    return {
      domains,
      overallMastered,
      overallTotal,
      overallPercent: overallTotal ? Math.round((overallMastered / overallTotal) * 100) : 0,
      coreMastered,
      coreTotal,
      corePercent: coreTotal ? Math.round((coreMastered / coreTotal) * 100) : 0,
      completedLevels,
      totalLevels,
      repeatQueue
    };
  }

  function validBestWpm(sessions, gate) {
    const valid = (sessions || []).filter(s => s.completedAt && Number(s.accuracy || 0) >= Number(s.targetAccuracy || gate || 97) && Number(s.exerciseBlocksCompleted || 0) > 0);
    return valid.length ? Math.max(...valid.map(s => Number(s.wpm || 0))) : 0;
  }

  function localDay(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-CA");
  }

  function lineColumn(value, index) {
    const text = String(value || "");
    const safeIndex = Math.max(0, Math.min(text.length, Number(index || 0)));
    const before = text.slice(0, safeIndex);
    const lines = before.split("\n");
    return { line: lines.length, column: lines[lines.length - 1].length + 1 };
  }

  function applyTabEdit(value, selectionStart, selectionEnd, shiftKey, indentSize = 4) {
    const text = String(value || "");
    const size = Math.max(1, Number(indentSize || 4));
    let start = Math.max(0, Math.min(text.length, Number(selectionStart || 0)));
    let end = Math.max(start, Math.min(text.length, Number(selectionEnd ?? start)));

    const lineStart = text.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const selectionEndsAtLineStart = end > start && text[end - 1] === "\n";
    let blockEnd = selectionEndsAtLineStart ? Math.max(lineStart, end - 1) : end;
    if (shiftKey && start === end) {
      const nextLineBreak = text.indexOf("\n", start);
      blockEnd = nextLineBreak === -1 ? text.length : nextLineBreak;
    }
    const spansMultipleLines = text.slice(lineStart, blockEnd).includes("\n");

    if (!shiftKey && start === end) {
      const { column } = lineColumn(text, start);
      const zeroBasedColumn = column - 1;
      const count = size - (zeroBasedColumn % size || 0);
      const spaces = " ".repeat(count);
      return {
        value: text.slice(0, start) + spaces + text.slice(end),
        selectionStart: start + count,
        selectionEnd: start + count
      };
    }

    if (!shiftKey && (spansMultipleLines || end > start)) {
      const selectedBlock = text.slice(lineStart, blockEnd);
      const lines = selectedBlock.split("\n");
      const indent = " ".repeat(size);
      const replacement = lines.map(line => indent + line).join("\n");
      const prefixAdjustment = size;
      const added = size * lines.length;
      return {
        value: text.slice(0, lineStart) + replacement + text.slice(blockEnd),
        selectionStart: start + prefixAdjustment,
        selectionEnd: end + added
      };
    }

    const selectedBlock = text.slice(lineStart, blockEnd);
    const lines = selectedBlock.split("\n");
    let removedBeforeStart = 0;
    let removedTotal = 0;
    const replacement = lines.map((line, index) => {
      const match = line.match(new RegExp(`^ {1,${size}}`));
      const removeCount = match ? match[0].length : (line.startsWith("\t") ? 1 : 0);
      if (index === 0) removedBeforeStart = Math.min(removeCount, Math.max(0, start - lineStart));
      removedTotal += removeCount;
      return line.slice(removeCount);
    }).join("\n");

    return {
      value: text.slice(0, lineStart) + replacement + text.slice(blockEnd),
      selectionStart: Math.max(lineStart, start - removedBeforeStart),
      selectionEnd: Math.max(lineStart, end - removedTotal)
    };
  }

  function sessionSummary(sessions, gate, now) {
    const completed = (sessions || []).filter(s => s.completedAt);
    const scored = completed.filter(s => s.completionStatus !== "INTERRUPTED" && Number(s.exerciseBlocksCompleted || 0) > 0);
    const current = now ? new Date(now) : new Date();
    const today = current.toLocaleDateString("en-CA");
    const todaySessions = completed.filter(s => localDay(s.startedAt) === today);
    const avg = values => values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;

    const days = [...new Set(scored.map(s => localDay(s.startedAt)).filter(Boolean))].sort().reverse();
    let streak = 0;
    const cursor = new Date(current);
    cursor.setHours(0, 0, 0, 0);
    for (const day of days) {
      const expected = cursor.toLocaleDateString("en-CA");
      if (day === expected) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
      if (streak === 0) {
        cursor.setDate(cursor.getDate() - 1);
        if (day === cursor.toLocaleDateString("en-CA")) {
          streak++;
          cursor.setDate(cursor.getDate() - 1);
          continue;
        }
      }
      break;
    }

    const weekStart = new Date(current);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - 6);
    const weekly = completed.filter(s => new Date(s.startedAt) >= weekStart);

    return {
      todayMinutes: Math.round(todaySessions.reduce((sum, s) => sum + Number(s.durationSeconds || 0), 0) / 60),
      weeklyMinutes: Math.round(weekly.reduce((sum, s) => sum + Number(s.durationSeconds || 0), 0) / 60),
      avgAccuracy: Number(avg(scored.map(s => Number(s.accuracy || 0))).toFixed(1)),
      bestWpm: validBestWpm(scored, gate),
      streak,
      completedSessions: completed.length
    };
  }

  return {
    RIGHT_HAND_KEYS,
    LEFT_HAND_KEYS,
    TECHNICAL_SYMBOLS,
    CORE_MODES,
    handOfExpectedChar,
    classifyMistakes,
    calculateTypingStats,
    lineColumn,
    applyTabEdit,
    allDrills,
    levelProgress,
    domainProgress,
    progressSummary,
    validBestWpm,
    sessionSummary,
    localDay
  };
});
