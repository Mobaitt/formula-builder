import type { OutputConfig } from '../types'

/**
 * Format a numeric result according to the output configuration.
 */
export function formatOutput(
  value: number | null | undefined,
  config: OutputConfig,
): string {
  if (value === null || value === undefined || (typeof value === 'number' && isNaN(value))) {
    return config.nullDisplay
  }

  let formatted: string

  if (config.useThousandsSeparator) {
    formatted = value.toLocaleString('en-US', {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    })
  } else {
    formatted = value.toFixed(config.decimals)
  }

  return `${config.prefix}${formatted}${config.suffix}`
}
