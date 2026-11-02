/**
 * The distribution rules live in src/shared/requests/rules.ts so the submit-request
 * function runs the same code; this module keeps the old import path working.
 */
export { needsDistribution, validateDistribution, type DistributionError } from '../shared/requests/rules.ts'
