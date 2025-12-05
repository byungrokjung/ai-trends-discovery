// 중국 수입 가능 상품 데이터베이스 (100개 이상)
export const chineseProducts = [
  // 건강/헬스케어 카테고리
  { name: '무선 목 마사지기 (EMS 6단계)', category: '헬스케어', expectedPrice: 45000, chinaPrice: 12000, keywords: ['목아파', '목이아파', '거북목', '마사지', '뻐근', '결림'], targetCustomer: '거북목 고민하는 직장인' },
  { name: '스마트 체온계 (앱 연동)', category: '헬스케어', expectedPrice: 45000, chinaPrice: 18000, keywords: ['열나', '아프다', '체온', '오한', '현기증'], targetCustomer: '건강 관리 필요한 가족' },
  { name: '블루투스 체중계 (체성분 분석)', category: '헬스케어', expectedPrice: 89000, chinaPrice: 35000, keywords: ['살찌', '살쪘어', '다이어트', '살빼', '몸무거워'], targetCustomer: '다이어트 중인 사람들' },
  { name: '휴대용 혈압측정기', category: '헬스케어', expectedPrice: 120000, chinaPrice: 45000, keywords: ['혈압', '건강검진', '어지러워'], targetCustomer: '혈압 관리 필요한 중년층' },
  { name: '스마트 베개 (수면분석)', category: '헬스케어', expectedPrice: 180000, chinaPrice: 70000, keywords: ['불면', '잠못자', '목아파'], targetCustomer: '수면 질 개선 원하는 직장인' },
  
  // 가전제품
  { name: '스마트 공기청정기 (UV-C 살균)', category: '가전', expectedPrice: 180000, chinaPrice: 65000, keywords: ['공기질', '미세먼지', '알레르기', '숨막혀', '호흡곤란', '기침'], targetCustomer: '미세먼지 걱정하는 가족' },
  { name: '휴대용 가습기 (USB 타입)', category: '가전', expectedPrice: 25000, chinaPrice: 8000, keywords: ['건조', '건조해', '피부트러블', '목마른', '따가워'], targetCustomer: '건조한 환경의 직장인' },
  { name: '미니 제습기 (무선)', category: '가전', expectedPrice: 35000, chinaPrice: 15000, keywords: ['습해', '곰팡이', '눅눅해', '끈적해', '냄새'], targetCustomer: '습한 환경 거주자' },
  { name: '휴대용 선풍기 (목걸이형)', category: '가전', expectedPrice: 28000, chinaPrice: 10000, keywords: ['더워', '덥다', '땀나', '뜨거워', '시원'], targetCustomer: '야외 활동 많은 사람들' },
  { name: 'USB 미니 히터', category: '가전', expectedPrice: 35000, chinaPrice: 12000, keywords: ['추워', '춥다', '손시려', '차가워', '따뜻'], targetCustomer: '추위 많이 타는 사람들' },
  
  // 전자기기 & IT
  { name: '무선 이어폰 (노이즈 캔슬링)', category: '전자기기', expectedPrice: 120000, chinaPrice: 45000, keywords: ['시끄러워', '집중안돼', '소음'], targetCustomer: '집중력 필요한 직장인/학생' },
  { name: '블루투스 키보드 (무선)', category: '전자기기', expectedPrice: 60000, chinaPrice: 25000, keywords: ['타이핑', '업무', '효율'], targetCustomer: '재택근무족' },
  { name: '무선 마우스 (인체공학적)', category: '전자기기', expectedPrice: 45000, chinaPrice: 18000, keywords: ['손목아파', '마우스', '업무'], targetCustomer: '장시간 컴퓨터 작업자' },
  { name: '스마트 워치 (건강관리)', category: '전자기기', expectedPrice: 150000, chinaPrice: 60000, keywords: ['운동', '건강', '심박수'], targetCustomer: '건강관리 관심 높은 20-30대' },
  { name: 'USB 허브 (멀티포트)', category: '전자기기', expectedPrice: 35000, chinaPrice: 12000, keywords: ['포트부족', '연결', 'USB'], targetCustomer: '디지털 기기 많은 직장인' },
  
  // 조명 & 인테리어
  { name: 'LED 스탠드 조명 (무선충전)', category: '인테리어', expectedPrice: 35000, chinaPrice: 15000, keywords: ['어두워', '조명', '공부'], targetCustomer: '재택근무족' },
  { name: '스마트 전구 (앱 제어)', category: '인테리어', expectedPrice: 25000, chinaPrice: 8000, keywords: ['조명조절', '분위기', '스마트홈'], targetCustomer: '스마트홈 관심 있는 젊은 층' },
  { name: 'LED 스트립 조명 (색상변경)', category: '인테리어', expectedPrice: 30000, chinaPrice: 10000, keywords: ['분위기', '인테리어', '게이밍'], targetCustomer: '인테리어 관심 있는 청년층' },
  { name: '센서 야간등', category: '인테리어', expectedPrice: 20000, chinaPrice: 7000, keywords: ['어두워', '야간', '안전'], targetCustomer: '야간 활동 많은 가족' },
  { name: '무선 충전 스탠드 (조명 겸용)', category: '전자기기', expectedPrice: 40000, chinaPrice: 16000, keywords: ['충전', '정리', '스마트폰'], targetCustomer: '정리정돈 좋아하는 직장인' },
  
  // 청소 & 정리용품
  { name: '로봇 청소기 (저가형)', category: '청소용품', expectedPrice: 200000, chinaPrice: 80000, keywords: ['청소', '귀찮아', '바빠'], targetCustomer: '바쁜 직장인 가정' },
  { name: '무선 핸디 청소기', category: '청소용품', expectedPrice: 80000, chinaPrice: 30000, keywords: ['청소', '먼지', '간편'], targetCustomer: '간편한 청소 원하는 1인 가구' },
  { name: '다목적 정리함 (투명)', category: '수납용품', expectedPrice: 15000, chinaPrice: 5000, keywords: ['정리', '수납', '지저분'], targetCustomer: '정리정돈 필요한 사람들' },
  { name: '옷걸이 정리대 (이동식)', category: '수납용품', expectedPrice: 45000, chinaPrice: 18000, keywords: ['옷정리', '수납공간', '원룸'], targetCustomer: '수납공간 부족한 원룸 거주자' },
  { name: '신발 정리대 (다층)', category: '수납용품', expectedPrice: 35000, chinaPrice: 12000, keywords: ['신발정리', '현관', '지저분'], targetCustomer: '신발 많은 가족' },
  
  // 주방용품
  { name: '에어프라이어 (소형)', category: '주방용품', expectedPrice: 120000, chinaPrice: 45000, keywords: ['요리', '간편', '혼밥'], targetCustomer: '간편 요리 선호하는 1인 가구' },
  { name: '전기 케틀 (온도조절)', category: '주방용품', expectedPrice: 40000, chinaPrice: 15000, keywords: ['차', '커피', '물끓이기'], targetCustomer: '차/커피 애호가' },
  { name: '블렌더 (휴대용)', category: '주방용품', expectedPrice: 35000, chinaPrice: 12000, keywords: ['스무디', '건강', '다이어트'], targetCustomer: '건강 관리하는 직장인' },
  { name: '실리콘 밀폐용기 세트', category: '주방용품', expectedPrice: 25000, chinaPrice: 8000, keywords: ['보관', '신선도', '정리'], targetCustomer: '음식 보관 신경 쓰는 주부' },
  { name: '자동 컵라면 조리기', category: '주방용품', expectedPrice: 30000, chinaPrice: 10000, keywords: ['간편식', '학식', '야식'], targetCustomer: '간편식 자주 먹는 학생/직장인' },
  
  // 운동 & 피트니스
  { name: '폼롤러 (전동 마사지)', category: '운동용품', expectedPrice: 80000, chinaPrice: 30000, keywords: ['근육', '운동후', '마사지'], targetCustomer: '운동하는 사람들' },
  { name: '요가매트 (두꺼운 타입)', category: '운동용품', expectedPrice: 35000, chinaPrice: 12000, keywords: ['요가', '홈트', '운동'], targetCustomer: '홈트레이닝하는 사람들' },
  { name: '덤벨 세트 (조절 가능)', category: '운동용품', expectedPrice: 80000, chinaPrice: 30000, keywords: ['근력운동', '홈트', '헬스'], targetCustomer: '홈짐 꾸미는 사람들' },
  { name: '줄넘기 (디지털 카운터)', category: '운동용품', expectedPrice: 25000, chinaPrice: 8000, keywords: ['유산소', '다이어트', '운동'], targetCustomer: '다이어트하는 사람들' },
  { name: '푸쉬업 바 (회전식)', category: '운동용품', expectedPrice: 30000, chinaPrice: 10000, keywords: ['푸쉬업', '상체운동', '홈트'], targetCustomer: '상체 운동하는 남성' },
  
  // 사무용품 & 학습
  { name: '독서대 (각도조절)', category: '사무용품', expectedPrice: 25000, chinaPrice: 8000, keywords: ['독서', '공부', '목아파'], targetCustomer: '학습량 많은 학생/직장인' },
  { name: '노트북 거치대 (높이조절)', category: '사무용품', expectedPrice: 35000, chinaPrice: 12000, keywords: ['목아파', '자세', '거북목'], targetCustomer: '노트북 장시간 사용자' },
  { name: '메모패드 (디지털)', category: '사무용품', expectedPrice: 40000, chinaPrice: 15000, keywords: ['메모', '필기', '정리'], targetCustomer: '메모 많이 하는 직장인' },
  { name: '화이트보드 (자석식 소형)', category: '사무용품', expectedPrice: 20000, chinaPrice: 7000, keywords: ['정리', '계획', '스케줄'], targetCustomer: '계획성 있게 생활하는 사람들' },
  { name: '펜꽂이 (회전형)', category: '사무용품', expectedPrice: 15000, chinaPrice: 5000, keywords: ['정리', '사무용품', '깔끔'], targetCustomer: '사무용품 정리 좋아하는 직장인' },
  
  // 자동차 용품
  { name: '차량용 공기청정기', category: '자동차용품', expectedPrice: 60000, chinaPrice: 22000, keywords: ['차냄새', '공기질', '운전'], targetCustomer: '차량 이용 많은 직장인' },
  { name: '핸드폰 거치대 (차량용)', category: '자동차용품', expectedPrice: 25000, chinaPrice: 8000, keywords: ['네비', '안전운전', '핸드폰'], targetCustomer: '차량 운전자' },
  { name: '차량용 청소기 (무선)', category: '자동차용품', expectedPrice: 40000, chinaPrice: 15000, keywords: ['차청소', '깔끔', '관리'], targetCustomer: '차량 관리 신경 쓰는 운전자' },
  { name: '시트 쿠션 (메모리폼)', category: '자동차용품', expectedPrice: 35000, chinaPrice: 12000, keywords: ['허리아파', '장거리운전', '편안'], targetCustomer: '장거리 운전 많은 사람들' },
  { name: '차량용 가습기', category: '자동차용품', expectedPrice: 30000, chinaPrice: 10000, keywords: ['건조', '차량', '겨울'], targetCustomer: '차량 이용 시간 긴 직장인' },
  
  // 펫용품
  { name: '자동 급식기 (스마트)', category: '펫용품', expectedPrice: 80000, chinaPrice: 30000, keywords: ['펫', '자동급식', '편리'], targetCustomer: '반려동물 키우는 직장인' },
  { name: '펫 카메라 (앱 연동)', category: '펫용품', expectedPrice: 100000, chinaPrice: 40000, keywords: ['펫모니터링', '안심', '외출'], targetCustomer: '반려동물 걱정 많은 주인' },
  { name: '자동 화장실 (고양이용)', category: '펫용품', expectedPrice: 200000, chinaPrice: 80000, keywords: ['고양이', '냄새', '청소'], targetCustomer: '고양이 키우는 1인 가구' },
  { name: '펫 운동기구 (자동 낚시대)', category: '펫용품', expectedPrice: 40000, chinaPrice: 15000, keywords: ['고양이놀이', '운동부족', '스트레스'], targetCustomer: '실내 고양이 키우는 주인' },
  { name: '펫 정수기 (순환형)', category: '펫용품', expectedPrice: 60000, chinaPrice: 22000, keywords: ['깨끗한물', '건강', '펫'], targetCustomer: '반려동물 건강 신경 쓰는 주인' },
  
  // 뷰티 & 개인관리
  { name: '페이스 스티머 (나노)', category: '뷰티', expectedPrice: 45000, chinaPrice: 18000, keywords: ['피부건조', '모공', '스킨케어'], targetCustomer: '피부관리 관심 높은 여성' },
  { name: '전동 세안브러시', category: '뷰티', expectedPrice: 35000, chinaPrice: 12000, keywords: ['세안', '블랙헤드', '모공'], targetCustomer: '꼼꼼한 세안 원하는 사람들' },
  { name: 'LED 마스크 (피부관리)', category: '뷰티', expectedPrice: 150000, chinaPrice: 60000, keywords: ['피부트러블', '안티에이징', '홈케어'], targetCustomer: '집에서 피부관리하는 여성' },
  { name: '전동 칫솔 (음파진동)', category: '개인관리', expectedPrice: 60000, chinaPrice: 22000, keywords: ['양치', '구강관리', '치아'], targetCustomer: '구강관리 신경 쓰는 사람들' },
  { name: '네일아트 프린터', category: '뷰티', expectedPrice: 200000, chinaPrice: 80000, keywords: ['네일아트', 'DIY', '집에서'], targetCustomer: '네일아트 좋아하는 여성' },
  
  // 수면 & 휴식
  { name: '수면 안대 (블루투스 음악)', category: '수면용품 > 안대', expectedPrice: 40000, chinaPrice: 15000, keywords: ['불면', '수면', '음악'], targetCustomer: '수면 질 개선 원하는 직장인' },
  { name: '목베개 (메모리폼)', category: '수면용품 > 베개', expectedPrice: 35000, chinaPrice: 12000, keywords: ['목아파', '잠', '베개'], targetCustomer: '목 통증 있는 사람들' },
  { name: '수면등 (점진적 밝기)', category: '수면용품 > 조명', expectedPrice: 30000, chinaPrice: 10000, keywords: ['수면', '조명', '편안'], targetCustomer: '수면 환경 신경 쓰는 사람들' },
  { name: '무릎베개 (수면용)', category: '수면용품 > 베개', expectedPrice: 25000, chinaPrice: 8000, keywords: ['허리아파', '수면자세', '편안'], targetCustomer: '허리 통증 있는 사람들' },
  { name: '화이트노이즈 머신', category: '수면용품 > 사운드', expectedPrice: 50000, chinaPrice: 20000, keywords: ['잠못자', '소음', '집중'], targetCustomer: '소음에 민감한 사람들' },
  
  // 키친 가젯
  { name: '전기 와플기 (미니)', category: '주방가전 > 간식', expectedPrice: 35000, chinaPrice: 12000, keywords: ['간식', '홈카페', 'DIY'], targetCustomer: '홈카페 즐기는 사람들' },
  { name: '계란 삶기 기계', category: '주방가전 > 조리', expectedPrice: 25000, chinaPrice: 8000, keywords: ['간편요리', '아침식사', '계란'], targetCustomer: '간편한 아침식사 원하는 직장인' },
  { name: '과일 건조기 (소형)', category: '주방가전 > 건조', expectedPrice: 80000, chinaPrice: 30000, keywords: ['건강간식', '과일', 'DIY'], targetCustomer: '건강한 간식 원하는 가족' },
  { name: '전동 소금후추 그라인더', category: '주방용품 > 조미료', expectedPrice: 20000, chinaPrice: 7000, keywords: ['요리', '편의', '간편'], targetCustomer: '요리 자주 하는 사람들' },
  { name: '스마트 계량컵', category: '주방용품', expectedPrice: 30000, chinaPrice: 10000, keywords: ['베이킹', '정확', '요리'], targetCustomer: '베이킹 좋아하는 사람들' }
]

// 카테고리별 필터링 헬퍼 함수들
export const getProductsByCategory = (category) => {
  return chineseProducts.filter(product => product.category === category)
}

export const getProductsByKeyword = (keyword) => {
  return chineseProducts.filter(product => 
    product.keywords.some(k => k.includes(keyword)) ||
    product.name.includes(keyword)
  )
}

export const getHighMarginProducts = (minMargin = 50) => {
  return chineseProducts.filter(product => {
    const margin = ((product.expectedPrice - product.chinaPrice) / product.expectedPrice) * 100
    return margin >= minMargin
  })
}

export const getProductsByPriceRange = (minPrice, maxPrice) => {
  return chineseProducts.filter(product => 
    product.expectedPrice >= minPrice && product.expectedPrice <= maxPrice
  )
}

// 카테고리 목록
export const categories = [
  "헬스케어", "뷰티", "전자기기", "자동차용품", "사무용품", 
  "가전", "인테리어", "주방용품", "수면용품", "운동용품",
  "펫용품", "패션소품", "청소용품", "수납용품", "취미용품",
  "학습용품", "문구용품", "개인관리"
]
