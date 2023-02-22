/// 版权
export enum VideoCopyRight {
    /// 原创
    Original = 1,
    // 转载
    Reproduction
}

export enum VideoSource {
    normal = 'vupload',
    mgtv = 'hunan',
    qq = 'qq',
}

export interface VideoRights {
    bp: number;
    elec: number;
    download: number;
    movie: number;
    pay: number;
    hd5: number;
    no_reprint: number;
    autoplay: number;
    ugc_pay: number;
    is_cooperation: number;
    ugc_pay_preview: number;
    no_background: number;
    clean_mode: number;
    is_stein_gate: number;
    is_360: number;
    no_share: number;
    arc_pay: number;
    free_watch: number;
}

export interface VideoDescriptionV2 {
    raw_text: string;
    type: number;
    biz_id: number;
}

export interface VideoOwner {
    mid: number;
    name: string; // UP主昵称
    face: string;
}

export interface VideoUploaderInfo {
    aid: number;
    view: number; // 播放数
    danmaku: number; // 弹幕数
    reply: number; // 评论数
    favorite: number; // 收藏数
    coin: number; // 投币数
    share: number; // 分享数
    now_rank: number; // 当前排名
    his_rank: number; // 历史最高排行
    like: number; // 获赞数
    dislike: number; // 点踩数
    evaluation: string;
    argue_msg: string;
}

export interface VideoDimension {
    width: number;
    height: number;
    rotate: number;
}

export interface VideoPageData {
    cid: number;
    page: number;
    from: VideoSource;
    part: string;
    duration: number;
    vid: string;
    weblink: string;
    dimension: VideoDimension | null;
}

export interface VideoSubTitleAuthor {
    mid: number;
    name: string;
    sex: string;
    face: string;
    sign: string;
    rank: number;
    birthday: number;
    is_fake_account: number;
    is_deleted: number;
}

export interface VideoSubTitleData {
    id: number;
    lan: string;
    lan_doc: string;
    is_lock: boolean;
    author_mid: number;
    subtitle_url: string;
    author: VideoSubTitleAuthor;
}

export interface VideoSubTitle {
    allow_submit: boolean;
    list: VideoSubTitleData[];
}

export interface VideoVipInfo {
    type: number;
    status: number;
    theme_type: number;
}

export interface VideoOfficialInfo {
    role: number;
    str: string;
    desc: string;
    type: number;
    official: VideoOfficialInfo;
    follower: number;
    label_style: number;
}

export interface VideoStaffMember {
    mid: number;
    title: string;
    name: string;
    face: string;
    vip: VideoVipInfo;
}

export interface VideoUserGarb {
    url_image_ani_cut: string;
}

export interface VideoHonorReply {

}

export interface VideoHonorReplyInfo {
    aid: number;
    type: number;
    desc: number;
    weekly_recommend_num: number;
}

export interface VideoInfoData {
    bvid: string;
    aid: number;
    videos: number;
    tid: number;
    tname: string;
    copyright: number;
    pic: string;
    title: string;
    pubdate: number;
    ctime: number;
    desc: string;
    desc_v2: VideoDescriptionV2[];
    // 稿件状态：https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/video/attribute_data.md#attribute%E5%AD%97%E6%AE%B5%E5%80%BC(%E7%A8%BF%E4%BB%B6%E5%B1%9E%E6%80%A7%E4%BD%8D)
    state: number;
    duration: number;
    // 撞车视频跳转avid
    forward: number;
    mission_id: number;
    redirect_url:number;
    rights: VideoRights;
    owner: VideoOwner;
    stat: VideoUploaderInfo;
    dynamic: string;
    cid: number;
    dimension: VideoDimension;
    premiere: null;
    teenage_mode: number;
    is_chargeable_season: boolean;
    is_story: boolean;
    no_cache: boolean;
    pages: VideoPageData[];
    subtitle: VideoSubTitle;
    staff: VideoStaffMember[];
    is_season_display: boolean;
    user_garb: VideoUserGarb;
    honor_reply: VideoHonorReply;
    like_icon: string;
}