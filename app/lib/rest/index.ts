import { AxiosResponse } from "axios";
import {
    CircuitBreakerConfig as BaseCircuitBreakerConfig,
    withCircuitBreaker as withBaseCircuitBreaker
} from "lib/circuit-breaker";

export type CircuitBreakerConfig = Omit<
    BaseCircuitBreakerConfig<AxiosResponse>,
    "validateResult"
>;

export function withCircuitBreaker<
    T extends (...args: any[]) => Promise<AxiosResponse>
>(
    func: T,
    config: CircuitBreakerConfig
): (...funcArgs: Parameters<T>) => Promise<AxiosResponse> {
    return withBaseCircuitBreaker(func, {
        ...config,
        validateResult: res => res.status == 200
    });
}
