// Cozy Worry Room - State & Logic

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. 상태 변수 정의 ---
  let isSavingMode = true; // 기본값: 저장 모드 ON (어두운 방)
  let worries = [];

  // --- 2. DOM 요소 참조 ---
  const roomContainer = document.getElementById('room-container');
  const statusText = document.getElementById('status-text');
  
  // 핫스팟
  const hotspotSwitch = document.getElementById('hotspot-switch');
  const hotspotDoll = document.getElementById('hotspot-doll');
  const hotspotBookshelf = document.getElementById('hotspot-bookshelf');
  const hotspotTrash = document.getElementById('hotspot-trash');
  const hotspotWindow = document.getElementById('hotspot-window');
  const hotspotFireplace = document.getElementById('hotspot-fireplace');

  // 모달 및 입력 UI
  const worryModal = document.getElementById('worry-modal');
  const worryInput = document.getElementById('worry-input');
  const charCount = document.getElementById('char-count');
  const btnCloseModal = document.getElementById('close-modal-btn');
  const btnActionWindow = document.getElementById('btn-action-window');
  const btnActionFireplace = document.getElementById('btn-action-fireplace');

  // 책장 서랍 UI
  const bookshelfDrawer = document.getElementById('bookshelf-drawer');
  const btnCloseDrawer = document.getElementById('close-drawer-btn');
  const emptyMessage = document.getElementById('empty-message');
  const worryList = document.getElementById('worry-list');

  // 토스트 컨테이너
  const toastContainer = document.getElementById('toast-container');


  // --- 3. 초기화 로직 ---
  function init() {
    // 저장 모드 불러오기
    const savedMode = localStorage.getItem('cozy_worry_saving_mode');
    if (savedMode !== null) {
      isSavingMode = savedMode === 'true';
    } else {
      isSavingMode = true; // 기본값
    }
    updateRoomTheme();

    // 걱정 기록 불러오기
    loadWorries();

    // 이벤트 리스너 등록
    setupEventListeners();
  }


  // --- 4. 이벤트 바인딩 ---
  function setupEventListeners() {
    // 스위치 토글
    hotspotSwitch.addEventListener('click', toggleSavingMode);

    // 걱정인형 클릭 -> 고민 입력 모달 열기
    hotspotDoll.addEventListener('click', openWorryModal);

    // 모달 닫기
    btnCloseModal.addEventListener('click', closeWorryModal);
    worryModal.addEventListener('click', (e) => {
      if (e.target === worryModal) closeWorryModal();
    });

    // 글자 수 세기
    worryInput.addEventListener('input', () => {
      const len = worryInput.value.length;
      charCount.textContent = len;
    });

    // 액션: 창문으로 날리기
    btnActionWindow.addEventListener('click', () => handleWorryAction('window'));

    // 액션: 벽난로에 태우기
    btnActionFireplace.addEventListener('click', () => handleWorryAction('fireplace'));

    // 창문 직접 클릭 -> 인형 클릭 유도 또는 이스터에그 알림
    hotspotWindow.addEventListener('click', () => {
      showToast('걱정인형을 클릭하여 마음의 편지를 먼저 작성해보세요.');
    });

    // 벽난로 직접 클릭
    hotspotFireplace.addEventListener('click', () => {
      showToast('타오르는 불꽃이 방 안을 따스하게 감싸 안아주고 있습니다.');
    });

    // 책장 클릭 -> 서랍 열기
    hotspotBookshelf.addEventListener('click', openBookshelfDrawer);

    // 책장 서랍 닫기
    btnCloseDrawer.addEventListener('click', closeBookshelfDrawer);
    bookshelfDrawer.addEventListener('click', (e) => {
      if (e.target === bookshelfDrawer) closeBookshelfDrawer();
    });

    // 휴지통 클릭 -> 전체 기록 삭제
    hotspotTrash.addEventListener('click', clearAllWorries);
  }


  // --- 5. 핵심 테마 제어 (스위치) ---
  function updateRoomTheme() {
    if (isSavingMode) {
      roomContainer.classList.remove('saving-mode-off');
      roomContainer.classList.add('saving-mode-on');
      statusText.textContent = '켜짐 (로컬 스토리지에 보관됨)';
      statusText.style.color = 'var(--color-accent)';
    } else {
      roomContainer.classList.remove('saving-mode-on');
      roomContainer.classList.add('saving-mode-off');
      statusText.textContent = '꺼짐 (기록이 남지 않는 세션 모드)';
      statusText.style.color = '#a39485';
    }
  }

  function toggleSavingMode() {
    isSavingMode = !isSavingMode;
    localStorage.setItem('cozy_worry_saving_mode', isSavingMode);
    updateRoomTheme();
    
    if (isSavingMode) {
      showToast('방의 조명이 아늑해지고, 걱정 기록장이 활성화되었습니다.');
    } else {
      showToast('방이 환해지고, 고민을 기록 없이 지워버리는 세션 모드가 되었습니다.');
    }
  }


  // --- 6. 입력 모달 제어 ---
  function openWorryModal() {
    worryInput.value = '';
    charCount.textContent = '0';
    worryModal.classList.add('active');
    worryInput.focus();
  }

  function closeWorryModal() {
    worryModal.classList.remove('active');
  }


  // --- 7. 고민 해소 액션 처리 및 애니메이션 ---
  function handleWorryAction(type) {
    const text = worryInput.value.trim();
    if (!text) {
      showToast('마음속 이야기를 한 글자 이상 적어주세요.');
      return;
    }

    // 모달을 먼저 닫음
    closeWorryModal();

    if (type === 'window') {
      // 종이비행기 애니메이션 실행
      triggerPlaneAnimation(() => {
        finalizeWorry(text, 'window');
      });
    } else if (type === 'fireplace') {
      // 벽난로 소각 애니메이션 실행
      triggerFireplaceAnimation(() => {
        finalizeWorry(text, 'fireplace');
      });
    }
  }

  // 종이비행기 날리기 애니메이션
  function triggerPlaneAnimation(callback) {
    const plane = document.createElement('div');
    plane.className = 'animation-plane';
    plane.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 50;
      animation: flyToWindow 1.6s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
    `;
    plane.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
      </svg>
    `;
    roomContainer.appendChild(plane);

    setTimeout(() => {
      plane.remove();
      if (callback) callback();
    }, 1600);
  }

  // 벽난로 소각 애니메이션
  function triggerFireplaceAnimation(callback) {
    const crumpled = document.createElement('div');
    crumpled.className = 'animation-crumpled';
    crumpled.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 50;
      animation: fallToFireplace 1.3s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards;
    `;
    crumpled.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" style="display:none;"/>
        <path d="M12 3c-1.2 0-2.3.3-3.2.8L7.3 5.3C6.3 6.1 5.5 7.1 5.2 8.4L4.1 10c-.5.9-.6 1.9-.3 2.8l.8 2.2c.4 1.1 1.2 2 2.3 2.5l2.1 1c.9.4 1.9.5 2.8.2l2.2-.8c1.1-.4 2-1.2 2.5-2.3l1-2.1c.4-.9.5-1.9.2-2.8l-.8-2.2c-.4-1.1-1.2-2-2.3-2.5l-2.1-1c-.9-.4-1.9-.5-2.8-.2z"/>
      </svg>
    `;
    roomContainer.appendChild(crumpled);

    setTimeout(() => {
      // 벽난로 위치(left: 14.5%, top: 58.5%)에서 스파크 생성
      createFireplaceSparks(14.5, 58.5);
      crumpled.remove();
      if (callback) callback();
    }, 1300);
  }

  // 벽난로 불꽃 스파크 효과 생성
  function createFireplaceSparks(leftPercent, topPercent) {
    const particleCount = 18;
    for (let i = 0; i < particleCount; i++) {
      const spark = document.createElement('div');
      spark.className = 'spark-particle';
      spark.style.left = leftPercent + '%';
      spark.style.top = topPercent + '%';

      // 포물선형 상승 및 사방 비산 방향 정의
      const tx = (Math.random() - 0.5) * 90; // 가로 비산 범위
      const ty = -Math.random() * 70 - 30;  // 세로 상승 높이
      
      spark.style.setProperty('--tx', `${tx}px`);
      spark.style.setProperty('--ty', `${ty}px`);

      // 크기 및 딜레이 난수 생성
      const size = Math.random() * 5 + 3;
      spark.style.width = size + 'px';
      spark.style.height = size + 'px';
      spark.style.animationDelay = `${Math.random() * 0.15}s`;

      roomContainer.appendChild(spark);

      // 소멸 후 DOM 제거
      setTimeout(() => {
        spark.remove();
      }, 1000);
    }
  }

  // 고민 처리 최종 완료 (로컬스토리지 및 토스트 연계)
  function finalizeWorry(text, actionType) {
    const now = new Date();
    // 날짜 포맷 예시: "2026. 06. 13. 20:30"
    const formattedDate = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, '0')}. ${String(now.getDate()).padStart(2, '0')}. ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (isSavingMode) {
      // 저장 모드인 경우: 기록 추가
      const newWorry = {
        id: Date.now(),
        content: text,
        date: formattedDate,
        method: actionType === 'window' ? '종이비행기' : '벽난로'
      };
      
      worries.unshift(newWorry); // 최신 글이 맨 위로
      saveWorries();
      renderWorryList();

      if (actionType === 'window') {
        showToast('걱정이 비행기에 실려 바람 속으로 날아갔습니다. 책장에 고이 기록되었습니다.');
      } else {
        showToast('걱정이 벽난로 불길 속에 타올라 재가 되었습니다. 책장에 고이 기록되었습니다.');
      }
    } else {
      // 저장 모드가 아닌 경우
      if (actionType === 'window') {
        showToast('걱정이 비행기에 실려 창밖 머나먼 밤하늘 너머로 날아갔습니다.');
      } else {
        showToast('걱정이 불꽃 속에서 온전히 녹아내려 흔적 없이 완전히 소멸했습니다.');
      }
    }
  }


  // --- 8. 상태 관리 & 로컬 스토리지 데이터 로직 ---
  function loadWorries() {
    const rawData = localStorage.getItem('cozy_worries');
    if (rawData) {
      try {
        worries = JSON.parse(rawData);
      } catch (e) {
        worries = [];
        localStorage.removeItem('cozy_worries');
      }
    } else {
      worries = [];
    }
  }

  function saveWorries() {
    localStorage.setItem('cozy_worries', JSON.stringify(worries));
  }

  // 모든 기록 초기화 (휴지통 기능)
  function clearAllWorries() {
    if (worries.length === 0) {
      showToast('책장에 쌓여 있는 걱정 기록이 없어 비울 수 없습니다.');
      return;
    }

    const confirmClear = confirm('책장에 쌓여 있는 모든 걱정 기록을 비우시겠습니까?\n이 작업은 되돌릴 수 없으며, 마음의 부담이 모두 흔적 없이 날아갑니다.');
    
    if (confirmClear) {
      worries = [];
      saveWorries();
      renderWorryList();
      showToast('모든 걱정의 기록이 방 안에서 깨끗이 청소되어 흔적도 없이 완전히 사라졌습니다.');
    }
  }

  // 개별 기록 삭제
  function deleteWorry(id) {
    worries = worries.filter(worry => worry.id !== id);
    saveWorries();
    renderWorryList();
    showToast('선택한 한 줌의 걱정 기록을 영구히 지웠습니다.');
  }


  // --- 9. 책장 드로어 UI 제어 및 렌더링 ---
  function openBookshelfDrawer() {
    if (!isSavingMode) {
      showToast('현재 세션 모드(저장 꺼짐)입니다. 저장 모드를 켜서 걱정을 남겨보세요.');
      return;
    }
    renderWorryList();
    bookshelfDrawer.classList.add('active');
  }

  function closeBookshelfDrawer() {
    bookshelfDrawer.classList.remove('active');
  }

  // 책장 리스트 렌더링
  function renderWorryList() {
    // 비어있는지 검증
    if (worries.length === 0) {
      emptyMessage.style.display = 'block';
      worryList.innerHTML = '';
      return;
    }

    emptyMessage.style.display = 'none';
    worryList.innerHTML = '';

    worries.forEach(worry => {
      const li = document.createElement('li');
      li.className = 'worry-item';
      
      // 소각/바람 아이콘용 표기
      const methodTag = worry.method === '종이비행기' ? '🌬️ 바람으로' : '🔥 불꽃으로';

      li.innerHTML = `
        <div class="worry-item-header">
          <span>${worry.date} (${methodTag})</span>
          <button class="delete-item-btn" data-id="${worry.id}">지우기</button>
        </div>
        <div class="worry-item-body">${escapeHTML(worry.content)}</div>
      `;

      // 개별 지우기 핸들러 바인딩
      const delBtn = li.querySelector('.delete-item-btn');
      delBtn.addEventListener('click', (e) => {
        const idToDelete = parseInt(e.target.getAttribute('data-id'), 10);
        deleteWorry(idToDelete);
      });

      worryList.appendChild(li);
    });
  }


  // --- 10. 공통 유틸리티 함수 ---
  // 토스트 메시지 생성
  function showToast(message) {
    // 기존 토스트 제거 (화면 복잡도 해소)
    const activeToasts = document.querySelectorAll('.toast');
    activeToasts.forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);

    // 3.5초 후 제거 (CSS 애니메이션 총 길이와 동기화)
    setTimeout(() => {
      toast.remove();
    }, 3500);
  }

  // HTML 이스케이프 (보안 대비)
  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 실행
  init();
});
