import IPCIDR from 'ip-cidr'
import { first, last, uniq } from 'lodash'

export const createSubnetCidrs = (cidrBlock: string, subnetsCount: number) => {
  const cidr = new IPCIDR(cidrBlock)

  const subnetsCountPowerOf2 = findNearestPowerOf2(subnetsCount)

  const criticals = new Array(subnetsCountPowerOf2).fill(0).map((_, index) => {
    // @ts-ignore
    const ips = cidr.toArray({
      limit: cidr.size / subnetsCountPowerOf2 + 1,
      from: (cidr.size / subnetsCountPowerOf2) * index,
    })

    const maskLength = 32 - Math.log2(cidr.size)
    const reservedMaskLength = Math.log2(subnetsCountPowerOf2)

    return [`${first(ips)}/${maskLength + reservedMaskLength}`, `${last(ips)}/${maskLength + reservedMaskLength}`]
  })

  return uniq(criticals.flat()).slice(0, subnetsCount)
}

const findNearestPowerOf2 = (value: number) => {
  let power = 0
  let result = 1
  while (result < value) {
    result = Math.pow(2, power)
    power += 1
  }

  return result
}
