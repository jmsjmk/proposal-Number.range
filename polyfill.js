/// <reference path="./global.d.ts" />
// syntax target = es2020
// This polyfill requires: globalThis, BigInt & private fields
;(() => {
    // Math.abs does not support BigInt.
    const abs = (x) => (x >= (typeof x === 'bigint' ? 0n : 0) ? x : -x)
    /*
     * Behaviour flags
     * This proposal is in early stage.
     * Use which in the end depends on community discussion.
     */
    /**
     * @type{boolean}
     * This flag treat `range(to)` as `range(0, to)`
     */
    const isAcceptAlias = false
    const IteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]()))
    class RangeIterator {
        /**
         *
         * @param {number | bigint} from
         * @param {number | bigint | undefined} to
         * @param {number | bigint | undefined} step
         * @param {"number" | "bigint"} type
         */
        constructor(from, to, step, type) {
            // Step 1 to 7
            if (typeof from !== type) throw new TypeError()
            if (type !== 'number' && type !== 'bigint') throw new TypeError('Assert failed')
            const zero = type === 'bigint' ? 0n : 0
            const one = type === 'bigint' ? 1n : 1
            if (isAcceptAlias === false) {
            } else if (typeof to === 'undefined') {
                // range(to) equals to range(zero, to)
                to = from
                from = zero
            }
            if (typeof step === 'undefined') step = one
            if (typeof from !== type) throw new TypeError()
            // Step 9 to 13
            // Allowing all kinds of number (number, bigint, decimals, ...) to range from a finite number to infinity.
            if (typeof to === 'number' && Number.isFinite(to)) if (typeof to !== type) throw new TypeError()
            if (typeof step !== type) throw new TypeError()
            // JavaScript is awesome, this code won't work
            // if (!Number.isFinite(from) || !Number.isFinite(step)) throw RangeError()
            if (
                (typeof from === 'number' && !Number.isFinite(from)) ||
                (typeof step === 'number' && !Number.isFinite(step))
            )
                throw RangeError()
            if (step === zero) throw new RangeError()
            // Step 14
            Object.setPrototypeOf(RangeIterator.prototype, IteratorPrototype)
            // Step 15 - 21
            this.#from = from
            this.#to = to
            this.#step = step
            this.#type = type
            this.#currentCount = one
            this.#lastValue = from
            return this
        }
        //#region internal slots
        /** @type {number | bigint} */
        #from
        /** @type {number | bigint} */
        #to
        /** @type {number | bigint} */
        #step
        /** @type {"number" | "bigint"} */
        #type
        /** @type {number | bigint} */
        #currentCount
        /** @type {number | bigint} */
        #lastValue
        //#endregion
        /**
         * @returns {IteratorResult<number | bigint>}
         */
        next() {
            // Step 1 to 3 omitted. Private field will do the brand check
            const from = this.#from
            const to = this.#to
            let step = this.#step
            const type = this.#type
            if (type !== 'bigint' && type !== 'number') throw new TypeError('Assertion failed')
            const zero = type === 'bigint' ? 0n : 0
            const one = type === 'bigint' ? 1n : 1
            if (Number.isNaN(from) || Number.isNaN(to) || Number.isNaN(step)) return { done: true, value: undefined }
            const ifIncrease = to > from
            const ifStepIncrease = step > zero
            if (ifIncrease !== ifStepIncrease) return { done: true, value: undefined }
            // Step 18
            /*
let currentCount = one
let lastValue = from
let condition = ifIncrease ? "!(lastValue >= to)" : "!(to >= lastValue)"
while (eval(condition)) {
    let yielding = lastValue
    lastValue = from + step * currentCount
    currentCount++
    yield yielding
}
             */
            let currentCount = this.#currentCount
            let lastValue = this.#lastValue
            const condition = ifIncrease ? () => !(lastValue >= to) : () => !(to >= lastValue)
            while (condition()) {
                lastValue = from + step * currentCount
                currentCount = currentCount + one
                this.#currentCount = currentCount
                this.#lastValue = lastValue
                return { done: false, value: lastValue }
            }
            return { done: true, undefined }
        }
        get from() {
            return this.#from
        }
        get to() {
            return this.#to
        }
        get step() {
            return this.#step
        }
    }
    Object.defineProperty(RangeIterator.prototype, Symbol.toStringTag, {
        writable: false,
        enumerable: false,
        configurable: true,
        value: 'RangeIterator',
    })
    if (typeof Number.range !== 'function') {
        Object.defineProperty(Number, 'range', {
            configurable: true,
            value: (from, to, step) => new RangeIterator(from, to, step, 'number'),
            writable: true,
        })
    }
    // If BigInt does not exist in globalThis, this will apply to FakeBigIntConstructor and then ignored.
    if (typeof BigInt.range !== 'function') {
        Object.defineProperty(BigInt, 'range', {
            configurable: true,
            value: (from, to, step) => new RangeIterator(from, to, step, 'bigint'),
            writable: true,
        })
    }
})()
