import { describe } from "mocha";
import { assert, expect } from "chai";
import {
    BreakerState,
    CircuitBreakerConfig,
    withCircuitBreaker
} from "lib/circuit-breaker";

const testBaseFunc = () => Promise.resolve(true);
const breakerBaseConfig: CircuitBreakerConfig<boolean> = {
    failureThreshold: 1,
    successThreshold: 1,
    timeoutInMs: 0
};

describe("Circuit breaker", () => {
    it("Should allow traffic through by default", async () => {
        const testFunction = withCircuitBreaker(
            testBaseFunc,
            breakerBaseConfig
        );

        await testFunction();
    });

    it("Should change the breaker when the threshold is met", async () => {
        let calledStateChange: boolean = false;
        const testFunction = withCircuitBreaker(testBaseFunc, {
            ...breakerBaseConfig,
            validateResult: () => false,
            onBreakerStateChange: breakerState =>
                (calledStateChange = breakerState == BreakerState.RED)
        });

        await testFunction();
        assert(
            calledStateChange,
            "Did not call CalledStateChange, or did not call it with the correct value"
        );
    });

    it("Should allow traffic through again once the timeout threshold is met", async () => {
        let latestState: BreakerState = BreakerState.GREEN;
        const testFunction = withCircuitBreaker(testBaseFunc, {
            ...breakerBaseConfig,
            validateResult: () => latestState == BreakerState.YELLOW,
            onBreakerStateChange: breakerState => (latestState = breakerState)
        });

        await testFunction();
        await testFunction();

        assert(
            latestState,
            "Did not call CalledStateChange, or did not call it with the correct value"
        );
    });

    it("Testing actions build", () => {
        assert(false);
    });
});
