declare namespace API {
  type IdType = string

  type AppAddRequest = {
    initPrompt?: string
  }

  type AppAdminUpdateRequest = {
    id?: IdType
    appName?: string
    cover?: string
    priority?: number
    category?: string
  }

  type cancelAppGenerationParams = {
    appId: IdType
  }

  type AppDeployRequest = {
    appId?: IdType
  }

  type AppQueryRequest = {
    pageNum?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    id?: IdType
    appName?: string
    cover?: string
    initPrompt?: string
    codeGenType?: string
    deployKey?: string
    priority?: number
    userId?: IdType
    category?: string
  }

  type AppUpdateRequest = {
    id?: IdType
    appName?: string
  }

  type AppVO = {
    id?: IdType
    appName?: string
    cover?: string
    initPrompt?: string
    codeGenType?: string
    deployKey?: string
    deployedTime?: string
    priority?: number
    userId?: IdType
    createTime?: string
    updateTime?: string
    user?: UserVO
    category?: string
  }

  type BaseResponseAppVO = {
    code?: number
    data?: AppVO
    message?: string
  }

  type BaseResponseBoolean = {
    code?: number
    data?: boolean
    message?: string
  }

  type BaseResponseLoginUserVO = {
    code?: number
    data?: LoginUserVO
    message?: string
  }

  type BaseResponseLong = {
    code?: number
    data?: IdType
    message?: string
  }

  type BaseResponsePageAppVO = {
    code?: number
    data?: PageAppVO
    message?: string
  }

  type BaseResponsePageChatHistory = {
    code?: number
    data?: PageChatHistory
    message?: string
  }

  type BaseResponsePageUserVO = {
    code?: number
    data?: PageUserVO
    message?: string
  }

  type BaseResponseString = {
    code?: number
    data?: string
    message?: string
  }

  type BaseResponseMapStringString = {
    code?: number
    data?: Record<string, string>
    message?: string
  }

  type BaseResponseUser = {
    code?: number
    data?: User
    message?: string
  }

  type BaseResponseUserVO = {
    code?: number
    data?: UserVO
    message?: string
  }

  type ChatHistory = {
    id?: IdType
    message?: string
    messageType?: string
    appId?: IdType
    userId?: IdType
    createTime?: string
    updateTime?: string
    isDelete?: number
  }

  type ChatHistoryQueryRequest = {
    pageNum?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    id?: IdType
    message?: string
    messageType?: string
    appId?: IdType
    userId?: IdType
    lastCreateTime?: string
  }

  type chatToGenCodeParams = {
    appId: IdType
    message: string
    useRag?: boolean
  }

  type DeleteRequest = {
    id?: IdType
  }

  type downloadAppCodeParams = {
    appId: IdType
  }

  type getAppVOByIdByAdminParams = {
    id: IdType
  }

  type getAppVOByIdParams = {
    id: IdType
  }

  type getUserByIdParams = {
    id: IdType
  }

  type getUserVOByIdParams = {
    id: IdType
  }

  type listAppChatHistoryParams = {
    appId: IdType
    pageSize?: number
    lastCreateTime?: string
  }

  type LoginUserVO = {
    id?: IdType
    userAccount?: string
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
    vipLevel?: number
    quota?: number
    createTime?: string
    updateTime?: string
  }

  type PageAppVO = {
    records?: AppVO[]
    pageNumber?: number
    pageSize?: number
    totalPage?: number
    totalRow?: number
    optimizeCountQuery?: boolean
  }

  type PageChatHistory = {
    records?: ChatHistory[]
    pageNumber?: number
    pageSize?: number
    totalPage?: number
    totalRow?: number
    optimizeCountQuery?: boolean
  }

  type PageUserVO = {
    records?: UserVO[]
    pageNumber?: number
    pageSize?: number
    totalPage?: number
    totalRow?: number
    optimizeCountQuery?: boolean
  }

  type ServerSentEventString = true

  type serveStaticResourceParams = {
    deployKey: string
  }

  type SysOperationLog = {
    id?: IdType
    userId?: IdType
    appId?: IdType
    username?: string
    ipAddress?: string
    requestUri?: string
    requestMethod?: string
    methodName?: string
    requestParams?: string
    operation?: string
    durationMs?: number
    status?: string
    startTime?: string
    endTime?: string
    createTime?: string
  }

  type BaseResponseListSysOperationLog = {
    code?: number
    data?: SysOperationLog[]
    message?: string
  }

  type LogQueryRequest = {
    pageNum?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    id?: IdType
    userId?: IdType
    username?: string
    ipAddress?: string
    requestUri?: string
    requestMethod?: string
    methodName?: string
    requestParams?: string
    createTime?: string
  }

  type LogDeleteRequest = {
    ids?: IdType[]
  }

  type PageSysOperationLog = {
    records?: SysOperationLog[]
    pageNumber?: number
    pageSize?: number
    totalPage?: number
    totalRow?: number
    optimizeCountQuery?: boolean
  }

  type BaseResponsePageSysOperationLog = {
    code?: number
    data?: PageSysOperationLog
    message?: string
  }

  type StatisticsVO = {
    todayCount?: number
    weekCount?: number
    monthCount?: number
    totalCount?: number
    successRate?: number
    avgDurationMs?: number
    activeUserCount?: number
    totalUserCount?: number
  }

  type BaseResponseStatisticsVO = {
    code?: number
    data?: StatisticsVO
    message?: string
  }

  type User = {
    id?: IdType
    userAccount?: string
    userPassword?: string
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
    editTime?: string
    createTime?: string
    updateTime?: string
    isDelete?: number
  }

  type UserAddRequest = {
    userName?: string
    userAccount?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
  }

  type UserLoginRequest = {
    userAccount?: string
    userPassword?: string
    captchaKey?: string
    captchaCode?: string
  }

  type UserQueryRequest = {
    pageNum?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    id?: IdType
    userName?: string
    userAccount?: string
    userProfile?: string
    userRole?: string
    vipLevel?: number
  }

  type UserRegisterRequest = {
    userAccount?: string
    userPassword?: string
    checkPassword?: string
  }

  type UserUpdateRequest = {
    id?: IdType
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
    vipLevel?: number
    quota?: number
  }

  type UserVO = {
    id?: IdType
    userAccount?: string
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
    vipLevel?: number
    quota?: number
    createTime?: string
  }
}
