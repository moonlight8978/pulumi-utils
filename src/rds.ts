import { rds } from '@pulumi/aws'
import { createName } from './naming'

export const postgresqlParameterGroup = new rds.ParameterGroup(createName('default-postgresql14-parameter-group'), {
  family: 'postgres14',
})
