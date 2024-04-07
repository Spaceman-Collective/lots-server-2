import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export interface AddCollateralParams {
    collateralDelta: BN;
}

export interface AddCollectionParams {

}

export interface AddCustodyParams {
    isStable: boolean;
    depegAdjustment: boolean;
    isVirtual: boolean;
    oracle: OracleParams;
    pricing: PricingParams;
    permissions: Permissions;
    fees: Fees;
    borrowRate: BorrowRateParams;
    ratios: TokenRatios[];
}

export interface AddLiquidityParams {
    amountIn: BN;
    minLpAmountOut: BN;
}

export interface AddMarketParams {
    side: Side;
    correlation: boolean;
    maxPayoffBps: BN;
    permissions: MarketPermissions;
}

export interface AddPoolParams {
    name: string;
    permissions: Permissions;
    maxAumUsd: BN;
    metadataTitle: string;
    metadataSymbol: string;
    metadataUri: string;
}

export interface ClosePositionParams {
    priceWithSlippage: OraclePrice;
    privilege: Privilege;
}

export interface CollectStakeRewardParams {

}

export interface CreateReferralParams {

}

export interface CreateTradingAccountParams {
    collectionIndex: number;
}

export interface DecreaseSizeParams {
    priceWithSlippage: OraclePrice;
    sizeDelta: BN;
    privilege: Privilege;
}

export interface DepositStakeParams {
    depositAmount: BN;
}

export interface ForceClosePositionParams {
    privilege: Privilege;
    isStopLoss: boolean;
}

export interface GetAddLiquidityAmountAndFeeParams {
    amountIn: BN;
}

export interface GetAssetsUnderManagementParams {

}

export interface GetEntryPriceAndFeeParams {
    collateral: BN;
    size: BN;
    side: Side;
}

export interface GetExitPriceAndFeeParams {

}

export interface GetLiquidationPriceParams {

}

export interface GetLiquidationStateParams {

}

export interface GetLpTokenPriceParams {

}

export interface GetOraclePriceParams {

}

export interface GetPnlParams {

}

export interface GetRemoveLiquidityAmountAndFeeParams {
    lpAmountIn: BN;
}

export interface GetSwapAmountAndFeesParams {
    amountIn: BN;
    useFeePool: boolean;
}

export interface IncreaseSizeParams {
    priceWithSlippage: OraclePrice;
    sizeDelta: BN;
    privilege: Privilege;
}

export interface InitStakingParams {

}

export interface InitParams {
    minSignatures: number;
    permissions: Permissions;
}

export interface LevelUpParams {

}

export interface LiquidateParams {

}

export interface OpenPositionParams {
    priceWithSlippage: OraclePrice;
    collateralAmount: BN;
    sizeAmount: BN;
    privilege: Privilege;
}

export interface RefreshStakeParams {

}

export interface RemoveCollateralParams {
    collateralDelta: BN;
}

export interface RemoveCustodyParams {
    ratios: TokenRatios[];
}

export interface RemoveLiquidityParams {
    lpAmountIn: BN;
    minAmountOut: BN;
}

export interface RemoveMarketParams {

}

export interface RemovePoolParams {

}

export interface SetAdminSignersParams {
    minSignatures: number;
}

export interface SetCustodyConfigParams {
    depegAdjustment: boolean;
    customOracleAccount: PublicKey;
    maxDivergenceBps: BN;
    maxConfBps: BN;
    maxPriceAgeSec: BN;
    pricing: PricingParams;
    permissions: Permissions;
    fees: Fees;
    borrowRate: BorrowRateParams;
    ratios: TokenRatios[];
    rewardThreshold: BN;
}

export interface SetCustomOraclePriceParams {
    price: BN;
    expo: number;
    conf: BN;
    ema: BN;
    publishTime: BN;
}

export interface SetFlpStakeConfigParams {
    feeShareBps: BN;
}

export interface SetMarketConfigParams {
    maxPayoffBps: BN;
    permissions: MarketPermissions;
}

export interface SetPermissionsParams {
    permissions: Permissions;
}

export interface SetPerpetualsConfigParams {
    allowUngatedTrading: boolean;
    tradingDiscount: [BN: 6];
    referralRebate: [BN: 6];
    referralDiscount: BN;
    voltageMultiplier: VoltageMultiplier;
}

export interface SetPoolConfigParams {
    permissions: Permissions;
    oracleAuthority: PublicKey;
    maxAumUsd: BN;
    stakingFeeShareBps: BN;
}

export interface SetTestTimeParams {
    time: BN;
}

export interface SetTriggerPriceParams {
    triggerPrice: OraclePrice;
    isStopLoss: boolean;
}

export interface SwapParams {
    amountIn: BN;
    minAmountOut: BN;
    useFeesPool: boolean;
}

export interface TestInitParams {
    minSignatures: number;
    permissions: Permissions;
}

export interface UnstakeInstantParams {
    unstakeAmount: BN;
}

export interface UnstakeRequestParams {
    unstakeAmount: BN;
}

export interface UpdateTokenRatiosParams {
    ratios: TokenRatios[];
}

export interface UpdateTradingAccountParams {

}

export interface WithdrawFeesParams {

}

export interface WithdrawSolFeesParams {
    amount: BN;
}

export interface WithdrawStakeParams {
    pendingActivation: boolean;
    deactivated: boolean;
}

export interface Fees {
    mode: FeesMode;
    swapIn: RatioFees;
    swapOut: RatioFees;
    stableSwapIn: RatioFees;
    stableSwapOut: RatioFees;
    addLiquidity: RatioFees;
    removeLiquidity: RatioFees;
    openPosition: BN;
    closePosition: BN;
    removeCollateral: BN;
}

export interface RatioFees {
    minFee: BN;
    targetFee: BN;
    maxFee: BN;
}

export interface Assets {
    collateral: BN;
    owned: BN;
    locked: BN;
}

export interface FeesStats {
    accrued: BN;
    distributed: BN;
    paid: BN;
    rewardPerLpStaked: BN;
    protocolFee: BN;
}

export interface PricingParams {
    tradeSpreadLong: BN;
    tradeSpreadShort: BN;
    swapSpread: BN;
    minInitialLeverage: BN;
    maxInitialLeverage: BN;
    maxLeverage: BN;
    minCollateralUsd: BN;
    delaySeconds: BN;
    maxUtilization: BN;
    maxPositionLockedUsd: BN;
    maxTotalLockedUsd: BN;
}

export interface BorrowRateParams {
    baseRate: BN;
    slope1: BN;
    slope2: BN;
    optimalUtilization: BN;
}

export interface BorrowRateState {
    currentRate: BN;
    cumulativeLockFee: BN;
    lastUpdate: BN;
}

export interface StakeStats {
    pendingActivation: BN;
    activeAmount: BN;
    pendingDeactivation: BN;
    deactivatedAmount: BN;
}

export interface MarketPermissions {
    allowOpenPosition: boolean;
    allowClosePosition: boolean;
    allowCollateralWithdrawal: boolean;
    allowSizeChange: boolean;
}

export interface PositionStats {
    openPositions: BN;
    updateTime: BN;
    averageEntryPrice: OraclePrice;
    sizeAmount: BN;
    sizeUsd: BN;
    lockedAmount: BN;
    lockedUsd: BN;
    collateralAmount: BN;
    collateralUsd: BN;
    unsettledFeeUsd: BN;
    cumulativeLockFeeSnapshot: BN;
    sizeDecimals: number;
    lockedDecimals: number;
    collateralDecimals: number;
}

export interface OraclePrice {
    price: BN;
    exponent: number;
}

export interface OracleParams {
    oracleAccount: PublicKey;
    customOracleAccount: PublicKey;
    oracleType: OracleType;
    maxDivergenceBps: BN;
    maxConfBps: BN;
    maxPriceAgeSec: BN;
}

export interface BackupOracle {
    price: BN;
    expo: number;
    conf: BN;
    emaPrice: BN;
    publishTime: BN;
}

export interface PermissionlessPythCache {
    backupCache: BackupOracle[];
}

export interface PriceAndFee {
    price: OraclePrice;
    fee: BN;
}

export interface AmountAndFee {
    amount: BN;
    fee: BN;
}

export interface NewPositionPricesAndFee {
    entryPrice: OraclePrice;
    fee: BN;
}

export interface SwapAmountAndFees {
    amountOut: BN;
    feeIn: BN;
    feeOut: BN;
}

export interface ProfitAndLoss {
    profit: BN;
    loss: BN;
}

export interface Permissions {
    allowSwap: boolean;
    allowAddLiquidity: boolean;
    allowRemoveLiquidity: boolean;
    allowOpenPosition: boolean;
    allowClosePosition: boolean;
    allowCollateralWithdrawal: boolean;
    allowSizeChange: boolean;
    allowLiquidation: boolean;
    allowFlpStaking: boolean;
    allowFeeDistribution: boolean;
    allowUngatedTrading: boolean;
    allowFeeDiscounts: boolean;
    allowReferralRebates: boolean;
}

export interface VoltageMultiplier {
    volume: BN;
    rewards: BN;
    rebates: BN;
}

export interface TokenRatios {
    target: BN;
    min: BN;
    max: BN;
}

export interface CustodyDetails {
    tradeSpreadLong: BN;
    tradeSpreadShort: BN;
    delaySeconds: BN;
    minPrice: OraclePrice;
    maxPrice: OraclePrice;
}

export interface VoltageStats {
    volumeUsd: BN;
    lpRewardsUsd: BN;
    referralRebateUsd: BN;
}

export enum FeesMode {
    Fixed = 'Fixed',
    Linear = 'Linear',
}

export enum FeesAction {
    AddLiquidity = 'AddLiquidity',
    RemoveLiquidity = 'RemoveLiquidity',
    SwapIn = 'SwapIn',
    SwapOut = 'SwapOut',
    StableSwapIn = 'StableSwapIn',
    StableSwapOut = 'StableSwapOut',
}

export enum Side {
    None = 'None',
    Long = 'Long',
    Short = 'Short',
}

export enum AdminInstruction {
    AddPool = 'AddPool',
    RemovePool = 'RemovePool',
    AddCustody = 'AddCustody',
    RemoveCustody = 'RemoveCustody',
    AddMarket = 'AddMarket',
    RemoveMarket = 'RemoveMarket',
    InitStaking = 'InitStaking',
    SetAdminSigners = 'SetAdminSigners',
    SetCustodyConfig = 'SetCustodyConfig',
    SetPermissions = 'SetPermissions',
    SetBorrowRate = 'SetBorrowRate',
    SetPerpetualsConfig = 'SetPerpetualsConfig',
    SetPoolConfig = 'SetPoolConfig',
    SetFlpStakeConfig = 'SetFlpStakeConfig',
    SetMarketConfig = 'SetMarketConfig',
    AddCollection = 'AddCollection',
    WithdrawFees = 'WithdrawFees',
    WithdrawSolFees = 'WithdrawSolFees',
    SetCustomOraclePrice = 'SetCustomOraclePrice',
    SetTestTime = 'SetTestTime',
    UpdateTokenRatios = 'UpdateTokenRatios',
}

export enum OracleType {
    None = 'None',
    Custom = 'Custom',
    Pyth = 'Pyth',
}

export enum AumCalcMode {
    IncludePnl = 'IncludePnl',
    ExcludePnl = 'ExcludePnl',
}

export enum Privilege {
    None = 'None',
    NFT = 'NFT',
    Referral = 'Referral',
}

export interface Custody {
    pool: PublicKey;
    mint: PublicKey;
    tokenAccount: PublicKey;
    decimals: number;
    isStable: boolean;
    depegAdjustment: boolean;
    isVirtual: boolean;
    distributeRewards: boolean;
    oracle: OracleParams;
    pricing: PricingParams;
    permissions: Permissions;
    fees: Fees;
    borrowRate: BorrowRateParams;
    rewardThreshold: BN;
    assets: Assets;
    feesStats: FeesStats;
    borrowRateState: BorrowRateState;
    bump: number;
    tokenAccountBump: number;
}

export interface FlpStake {
    owner: PublicKey;
    pool: PublicKey;
    stakeStats: StakeStats;
    rewardSnapshot: BN;
    unclaimedRewards: BN;
    feeShareBps: BN;
    isInitialized: boolean;
    bump: number;
}

export interface Market {
    pool: PublicKey;
    targetCustody: PublicKey;
    collateralCustody: PublicKey;
    side: Side;
    correlation: boolean;
    maxPayoffBps: BN;
    permissions: MarketPermissions;
    openInterest: BN;
    collectivePosition: PositionStats;
    targetCustodyId: BN;
    collateralCustodyId: BN;
    bump: number;
}

export interface Multisig {
    numSigners: number;
    numSigned: number;
    minSignatures: number;
    instructionAccountsLen: number;
    instructionDataLen: number;
    instructionHash: BN;
    signers: [PublicKey: 6];
    signed: [number: 6];
    bump: number;
}

export interface CustomOracle {
    price: BN;
    expo: number;
    conf: BN;
    ema: BN;
    publishTime: BN;
}

export interface Perpetuals {
    permissions: Permissions;
    pools: PublicKey[];
    collections: PublicKey[];
    voltageMultiplier: VoltageMultiplier;
    tradingDiscount: [BN: 6];
    referralRebate: [BN: 6];
    referralDiscount: BN;
    inceptionTime: BN;
    transferAuthorityBump: number;
    perpetualsBump: number;
}

export interface Pool {
    name: string;
    permissions: Permissions;
    inceptionTime: BN;
    flpMint: PublicKey;
    oracleAuthority: PublicKey;
    flpTokenAccount: PublicKey;
    rewardCustody: PublicKey;
    custodies: PublicKey[];
    ratios: TokenRatios[];
    markets: PublicKey[];
    maxAumUsd: BN;
    aumUsd: BN;
    totalStaked: StakeStats;
    stakingFeeShareBps: BN;
    bump: number;
    flpMintBump: number;
    flpTokenAccountBump: number;
    vpVolumeFactor: number;
}

export interface Position {
    owner: PublicKey;
    market: PublicKey;
    delegate: PublicKey;
    openTime: BN;
    updateTime: BN;
    entryPrice: OraclePrice;
    sizeAmount: BN;
    sizeUsd: BN;
    lockedAmount: BN;
    lockedUsd: BN;
    collateralAmount: BN;
    collateralUsd: BN;
    unsettledAmount: BN;
    unsettledFeesUsd: BN;
    cumulativeLockFeeSnapshot: BN;
    takeProfitPrice: OraclePrice;
    stopLossPrice: OraclePrice;
    sizeDecimals: number;
    lockedDecimals: number;
    collateralDecimals: number;
    bump: number;
}

export interface Referral {
    isInitialized: boolean;
    bump: number;
    refererTradingAccount: PublicKey;
    padding: [BN: 8];
}

export interface Trading {
    nftMint: PublicKey;
    owner: PublicKey;
    delegate: PublicKey;
    isInitialized: boolean;
    level: number;
    bump: number;
    voltagePoints: BN;
    stats: VoltageStats;
    snapshot: VoltageStats;
    padding: [BN: 8];
}

export interface AddCollateralLog {
    owner: PublicKey;
    market: PublicKey;
    collateralAmount: BN;
    collateralPriceUsd: BN;
}

export interface AddLiquidityLog {
    poolName: string;
    owner: PublicKey;
    custodyId: BN;
    amountIn: BN;
    lpAmountOut: BN;
    feeAmount: BN;
}

export interface ClosePositionLog {
    owner: PublicKey;
    market: PublicKey;
    priceUsd: BN;
    sizeAmount: BN;
    sizeUsd: BN;
    profitUsd: BN;
    lossUsd: BN;
    feeAmount: BN;
}

export interface CollectStakeRewardLog {
    owner: PublicKey;
    feeCollected: BN;
}

export interface DecreaseSizeLog {
    owner: PublicKey;
    market: PublicKey;
    priceUsd: BN;
    sizeDelta: BN;
    sizeDeltaUsd: BN;
    settledReturns: BN;
    deltaProfitUsd: BN;
    deltaLossUsd: BN;
    feeAmount: BN;
}

export interface DepositStakeLog {
    owner: PublicKey;
    lpTokens: BN;
}

export interface ForceClosePositionLog {
    owner: PublicKey;
    market: PublicKey;
    priceUsd: BN;
    sizeAmount: BN;
    sizeUsd: BN;
    profitUsd: BN;
    lossUsd: BN;
    feeAmount: BN;
    isStopLoss: boolean;
}

export interface IncreaseSizeLog {
    owner: PublicKey;
    market: PublicKey;
    priceUsd: BN;
    sizeAmount: BN;
    sizeUsd: BN;
    feeAmount: BN;
}

export interface LiquidateLog {
    owner: PublicKey;
    market: PublicKey;
    priceUsd: BN;
    sizeUsd: BN;
    sizeAmount: BN;
    feeAmount: BN;
}

export interface OpenPositionLog {
    owner: PublicKey;
    market: PublicKey;
    priceUsd: BN;
    sizeAmount: BN;
    sizeUsd: BN;
    collateralAmount: BN;
    collateralUsd: BN;
    feeAmount: BN;
}

export interface RemoveCollateralLog {
    owner: PublicKey;
    market: PublicKey;
    collateralAmount: BN;
    collateralPriceUsd: BN;
}

export interface RemoveLiquidityLog {
    poolName: string;
    owner: PublicKey;
    custodyId: BN;
    lpAmountIn: BN;
    amountOut: BN;
    feeAmount: BN;
}

export interface SetTriggerPriceLog {
    owner: PublicKey;
    market: PublicKey;
    priceUsd: BN;
    isStopLoss: boolean;
}

export interface SwapLog {
    poolName: string;
    owner: PublicKey;
    custodyIdIn: BN;
    custodyIdOut: BN;
    amountIn: BN;
    amountOut: BN;
    feeInAmount: BN;
    feeOutAmount: BN;
}

export interface UnstakeRequestLog {
    owner: PublicKey;
    lpTokens: BN;
}

export interface WithdrawStakeLog {
    owner: PublicKey;
    lpTokens: BN;
}