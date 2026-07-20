/**
 * Tests para src/addresses.ts (5 funciones puras, sin IO).
 *
 * Estrategia: cada función exportada se prueba con sus branches explícitos:
 *  - envelopeAddrToString:     address / mailbox+host / ninguno, name/no name
 *  - addrListToString:         empty/undefined + list con inválidos para filtrar
 *  - addrListToArray:          undefined vs list (filter)
 *  - addressesToArray:         field undefined / field is array / field is single / v sin name / v sin address
 *  - extractEmail:             con y sin < >
 *  - addrMatches:              con y sin < >, case-insensitive, true/false
 */
import { describe, it, expect } from 'vitest'
import {
  envelopeAddrToString,
  addrListToString,
  addrListToArray,
  addressesToArray,
  extractEmail,
  addrMatches,
} from '../src/addresses.js'

describe('envelopeAddrToString', () => {
  it('returns undefined when neither address nor mailbox+host provided', () => {
    expect(envelopeAddrToString({})).toBeUndefined()
    expect(envelopeAddrToString({ name: 'Anonymous' })).toBeUndefined()
    expect(envelopeAddrToString({ mailbox: 'partial' })).toBeUndefined()
  })

  it('composes mail from mailbox + host when address is missing', () => {
    expect(envelopeAddrToString({ mailbox: 'user', host: 'example.com' })).toBe(
      'user@example.com',
    )
  })

  it('formats with name when address present', () => {
    expect(
      envelopeAddrToString({ name: 'Alex', address: 'alex@example.com' }),
    ).toBe('Alex <alex@example.com>')
  })

  it('formats with name when composed from mailbox + host', () => {
    expect(
      envelopeAddrToString({
        name: 'María García',
        mailbox: 'maria',
        host: 'proton.me',
      }),
    ).toBe('María García <maria@proton.me>')
  })

  it('omits <> when no name and address defined', () => {
    expect(envelopeAddrToString({ address: 'bare@example.com' })).toBe(
      'bare@example.com',
    )
  })
})

describe('addrListToString', () => {
  it('returns undefined for undefined list', () => {
    expect(addrListToString(undefined)).toBeUndefined()
  })

  it('returns undefined for empty list', () => {
    expect(addrListToString([])).toBeUndefined()
  })

  it('joins valid addresses with comma-space', () => {
    const result = addrListToString([
      { address: 'a@example.com' },
      { name: 'B', address: 'b@example.com' },
    ])
    expect(result).toBe('a@example.com, B <b@example.com>')
  })

  it('filters out entries that resolve to undefined', () => {
    const result = addrListToString([
      { address: 'valid@example.com' },
      {}, // sin address ni mailbox+host → undefined; se filtra
      { mailbox: 'malformed', host: 'example.com' }, // válido (mailbox+host)
      { mailbox: 'no-host' }, // inválido
    ])
    expect(result).toBe(
      'valid@example.com, malformed@example.com',
    )
  })

  it('returns empty string when all entries resolve to undefined', () => {
    // Detalle sutil: el source solo retorna `undefined` cuando `!list || list.length === 0`.
    // Para una lista NO-vacía donde cada entrada se filtra a undefined, `join()` produce ''.
    const result = addrListToString([
      {},
      { mailbox: 'no-host' },
    ])
    expect(result).toBe('')
  })
})

describe('addrListToArray', () => {
  it('returns [] for undefined list', () => {
    expect(addrListToArray(undefined)).toEqual([])
  })

  it('returns [] for empty list', () => {
    expect(addrListToArray([])).toEqual([])
  })

  it('filters out undefined entries with Boolean filter', () => {
    const result = addrListToArray([
      { address: 'a@example.com' },
      {}, // undefined → filter removes
      { address: 'b@example.com' },
    ])
    // `s is string` predicate: TS narrowing branch
    expect(result).toEqual(['a@example.com', 'b@example.com'])
  })

  it('includes name-formatted entries', () => {
    const result = addrListToArray([
      { name: 'Alex', address: 'alex@example.com' },
    ])
    expect(result).toEqual(['Alex <alex@example.com>'])
  })
})

describe('addressesToArray', () => {
  it('returns [] when field is undefined (to/replyTo)', () => {
    expect(addressesToArray(undefined)).toEqual([])
  })

  it('handles a single ParsedAddress object (not wrapped in array)', () => {
    // mailparser `to` can be a single object, not always an array
    const single = {
      value: [{ address: 'one@example.com', name: 'One' }],
    }
    expect(addressesToArray(single)).toEqual(['One <one@example.com>'])
  })

  it('handles an array of ParsedAddress objects', () => {
    const arr = [
      {
        value: [
          { address: 'a@example.com', name: 'A' },
          { address: 'b@example.com' }, // sin name → branch sin formato
        ],
      },
      {
        value: [{ address: 'c@example.com', name: 'C' }],
      },
    ]
    // Branch: `for (const item of list)` + `for (const v of item.value)` + `v.address ? name+addr : address`
    expect(addressesToArray(arr)).toEqual([
      'A <a@example.com>',
      'b@example.com',
      'C <c@example.com>',
    ])
  })

  it('skips item.value entries with no address', () => {
    const arr = [
      {
        value: [
          { name: 'NoAddr' }, // sin address → no se añade
          { address: 'real@example.com' },
        ],
      },
    ]
    expect(addressesToArray(arr)).toEqual(['real@example.com'])
  })

  it('returns [] when all items have no address', () => {
    const arr = [{ value: [{ name: 'X' }] }, { value: [{ name: 'Y' }] }]
    expect(addressesToArray(arr)).toEqual([])
  })

  it('omits <> for address with no name', () => {
    const arr = [{ value: [{ address: 'naked@example.com' }] }]
    // Branch: `v.name ? \`${v.name} <${v.address}>\` : v.address`
    expect(addressesToArray(arr)).toEqual(['naked@example.com'])
  })
})

describe('extractEmail', () => {
  it('extracts email from "Name <email>"', () => {
    expect(extractEmail('Alex <alex@example.com>')).toBe('alex@example.com')
  })

  it('returns the bare string when no angle brackets present', () => {
    expect(extractEmail('bare@example.com')).toBe('bare@example.com')
  })

  it('trims whitespace from bare string', () => {
    expect(extractEmail('  bare@example.com  ')).toBe('bare@example.com')
  })

  it('trims whitespace inside extracted email', () => {
    expect(extractEmail('Alex <  alex@example.com  >')).toBe('alex@example.com')
  })
})

describe('addrMatches', () => {
  it('matches bare addresses case-insensitively', () => {
    expect(addrMatches('Alex@Example.COM', 'alex@example.com')).toBe(true)
    expect(addrMatches('ALEX@EXAMPLE.COM', 'alex@example.com')).toBe(true)
  })

  it('matches "Name <email>" formatted strings', () => {
    expect(addrMatches('Alex <alex@example.com>', 'alex@example.com')).toBe(
      true,
    )
  })

  it('returns false for non-matching addresses', () => {
    expect(addrMatches('alex@example.com', 'bob@example.com')).toBe(false)
    expect(addrMatches('Alex <alex@example.com>', 'bob@example.com')).toBe(
      false,
    )
  })

  it('handles non-matching strings without <>', () => {
    expect(addrMatches('hello@example.com', 'world@example.com')).toBe(false)
  })

  it('trims whitespace in target', () => {
    expect(addrMatches('alex@example.com', '  alex@example.com  ')).toBe(true)
  })
})
