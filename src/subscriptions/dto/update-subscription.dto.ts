import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const subscriptionStatuses = ['TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED'] as const;

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  planName?: string;

  @IsOptional()
  @IsIn(subscriptionStatuses)
  status?: (typeof subscriptionStatuses)[number];
}
