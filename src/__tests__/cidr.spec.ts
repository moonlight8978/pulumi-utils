import { createSubnetCidrs } from '../cidr'

test('it split correctly with power of 2', () => {
  const subnetCidrs = createSubnetCidrs('30.0.0.0/16', 4)

  expect(subnetCidrs).toEqual(['30.0.0.0/18', '30.0.64.0/18', '30.0.128.0/18', '30.0.192.0/18'])
})

test('it split correctly with non-power of 2', () => {
  const subnetCidrs = createSubnetCidrs('30.0.0.0/16', 3)

  expect(subnetCidrs).toEqual(['30.0.0.0/18', '30.0.64.0/18', '30.0.128.0/18'])
})

test('it split correctly az', () => {
  const subnetCidrs = createSubnetCidrs('30.0.64.0/18', 4)
  expect(subnetCidrs).toEqual(['30.0.64.0/20', '30.0.80.0/20', '30.0.96.0/20', '30.0.112.0/20'])
})
