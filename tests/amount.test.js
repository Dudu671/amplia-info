import assert from "node:assert/strict";
import { test } from "node:test";
import { convertAmount, formatAmountInput, parseAmountInput, sanitizeAmountInput } from "../app/utils/amount.js";

test("aceita valor brasileiro e remove o que não é número", () => {
    assert.equal(sanitizeAmountInput("1a0,5b0"), "10,50");
    assert.equal(parseAmountInput("1.050,50"), 1050.5);
    assert.equal(parseAmountInput("10,5"), 10.5);
    assert.equal(parseAmountInput("10,"), 10);
    assert.equal(parseAmountInput(""), null);
});

test("converte nos dois sentidos pela mesma cotação", () => {
    const rate = 5.4212;
    const inBrl = convertAmount(10, rate, "to-brl");
    const inForeign = convertAmount(inBrl, rate, "to-foreign");

    assert.equal(formatAmountInput(inBrl), "54,21");
    assert.equal(inForeign, 10);
    assert.equal(convertAmount(10, 0, "to-foreign"), null);
});
