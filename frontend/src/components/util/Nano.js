import { blake2b } from 'blakejs'

export function compareArrays(array1, array2) {
    for (let i = 0; i < array1.length; i++) {
      if (array1[i] !== array2[i]) return false
    }
  
    return true
  }

function readChar(char) {
    const alphabet = '13456789abcdefghijkmnopqrstuwxyz'
    const idx = alphabet.indexOf(char)

    if (idx === -1) {
        throw new Error(`Invalid character found: ${char}`)
    }

    return idx
}


export function decodeNanoBase32(input){
    const length = input.length
    const leftover = (length * 5) % 8
    const offset = leftover === 0 ? 0 : 8 - leftover
  
    let bits = 0
    let value = 0
  
    let index = 0
    let output = new Uint8Array(Math.ceil((length * 5) / 8))
  
    for (let i = 0; i < length; i++) {
      value = (value << 5) | readChar(input[i])
      bits += 5
  
      if (bits >= 8) {
        output[index++] = (value >>> (bits + offset - 8)) & 255
        bits -= 8
      }
    }
    if (bits > 0) {
      output[index++] = (value << (bits + offset - 8)) & 255
    }
  
    if (leftover !== 0) {
      output = output.slice(1)
    }
    return output
  }

export function validateNanoAddress(address) {
    
    if (
        typeof address !== "string" ||
        !/^(xrb_|nano_)[13][13-9a-km-uw-z]{59}$/.test(address)
    ) {
        return false
    }
    
    let prefixLength
    if ((address).startsWith('xrb_')) {
        prefixLength = 4
    } else {
        prefixLength = 5
    }
    
    const publicKeyBytes = decodeNanoBase32(
        (address).substr(prefixLength, 52)
    )
    const checksumBytes = decodeNanoBase32(
        (address).substr(prefixLength + 52)
    )
    
    const computedChecksumBytes = blake2b(publicKeyBytes, null, 5).reverse()
    
    const valid = compareArrays(checksumBytes, computedChecksumBytes)
    
    if (!valid) return false
    
    return true
}