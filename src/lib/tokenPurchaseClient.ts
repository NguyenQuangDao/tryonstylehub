export type TokenPurchaseStatus = 'pending' | 'completed' | 'failed'

export interface TokenPurchaseData {
  userId: string
  stripePaymentId: string
  amount: number
  tokens: number
  status: TokenPurchaseStatus
}

export interface TokenPurchaseRecord extends TokenPurchaseData {
  id: string
  createdAt: Date
}

export interface TokenPurchaseDelegate {
  findFirst(args: { where: { stripePaymentId?: string; userId?: string } }): Promise<TokenPurchaseRecord | null>
  findMany(args: {
    where?: { userId?: string }
    orderBy?: { createdAt: 'desc' | 'asc' }
    take?: number
    select?: { id?: true; amount?: true; tokens?: true; status?: true; createdAt?: true; stripePaymentId?: true }
  }): Promise<TokenPurchaseRecord[]>
  create(args: { data: TokenPurchaseData }): Promise<TokenPurchaseRecord>
}

export function getTokenPurchaseClient<T>(client: T): TokenPurchaseDelegate {
  return (client as unknown as { tokenPurchase: TokenPurchaseDelegate }).tokenPurchase
}
