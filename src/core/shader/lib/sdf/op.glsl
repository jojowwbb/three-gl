//并集
float opUnion(float d1, float d2) {
    return min(d1, d2);
}

//交集
float opIntersection(float d1, float d2) {
    return max(d1, d2);
}

//差
float opSubtraction(float d1, float d2) {
    return max(-d1, d2);
}

//圆角
float opRound(in float d, in float r) {
    return d - r;
}

//镂空
float opOnion(in float d, in float r) {
    return abs(d) - r;
}

//平滑效果
float opSmooth(in float d) {
    return smoothstep(0., .2, d);
}
