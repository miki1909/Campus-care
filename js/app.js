/**
 * CampusSetu / CampusCare — Smart Campus Problem Solver
 * Core Application Logic, Triage Engine & Analytics
 */

(function () {
  'use strict';

  // --- State Initialization & Local Storage ---
  const STORAGE_KEY = 'campuscare_issues_v2';
  let issues = [];

  function loadIssues() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        issues = JSON.parse(stored);
      } else {
        issues = JSON.parse(JSON.stringify(INITIAL_DEMO_ISSUES));
        saveIssues();
      }
    } catch (e) {
      console.warn('localStorage error, using defaults', e);
      issues = JSON.parse(JSON.stringify(INITIAL_DEMO_ISSUES));
    }
  }

  function saveIssues() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
    } catch (e) {
      console.warn('Unable to save to localStorage', e);
    }
  }

  function resetDemoData() {
    issues = JSON.parse(JSON.stringify(INITIAL_DEMO_ISSUES));
    saveIssues();
    renderAllViews();
    showToast('Demo data reset to default benchmark dataset.', 'info');
  }

  // --- Router & Tab Management ---
  const pages = ['home', 'report', 'hub', 'insights'];
  let currentPage = 'home';

  function navigateTo(pageId) {
    if (!pages.includes(pageId)) pageId = 'home';
    currentPage = pageId;

    // Update active view
    document.querySelectorAll('.page-view').forEach(view => {
      view.classList.remove('active');
    });
    const targetView = document.getElementById(`view-${pageId}`);
    if (targetView) targetView.classList.add('active');

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-target') === pageId) {
        link.classList.add('active');
      }
    });

    // Close mobile menu if open
    const navMenu = document.getElementById('nav-menu');
    if (navMenu) navMenu.classList.remove('open');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Refresh view states
    if (pageId === 'hub') {
      applyHubFilters();
    } else if (pageId === 'insights') {
      renderInsights();
    } else if (pageId === 'home') {
      updateHomeVitals();
    }

    // Update URL hash
    window.location.hash = pageId;
  }

  // --- Privacy & Inappropriate Content Scanner (Human Review Flagging) ---
  const PRIVACY_PATTERNS = {
    phone: /\b(?:\+91[\-\s]?)?[6-9]\d{9}\b/g,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    roll: /\b\d{2}[A-Za-z]{2,4}\d{3,4}\b/gi,
    inappropriate: /\b(abuse|stupid|idiot|harass|harassment|bribe|corrupt|scam|scammer|hate|threat|fake)\b/gi
  };

  function scanForPrivacyAndContent(text) {
    const findings = [];
    if (PRIVACY_PATTERNS.phone.test(text)) findings.push('Phone Number');
    if (PRIVACY_PATTERNS.email.test(text)) findings.push('Email Address');
    if (PRIVACY_PATTERNS.roll.test(text)) findings.push('Student Roll / ID');
    if (PRIVACY_PATTERNS.inappropriate.test(text)) findings.push('Inappropriate / Unverified Content');
    return findings;
  }

  function sanitizeSensitiveData(text) {
    let sanitized = text;
    sanitized = sanitized.replace(PRIVACY_PATTERNS.phone, '[PHONE REDACTED]');
    sanitized = sanitized.replace(PRIVACY_PATTERNS.email, '[EMAIL REDACTED]');
    sanitized = sanitized.replace(PRIVACY_PATTERNS.roll, '[ROLL NUMBER REDACTED]');
    return sanitized;
  }

  // --- Duplicate Detection Engine (Area + Category + Title tokens) ---
  function tokenize(str) {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !['the', 'and', 'for', 'with', 'not', 'this', 'that', 'from', 'near', 'room'].includes(w));
  }

  function extractArea(locationStr) {
    if (!locationStr) return '';
    return locationStr.split(',')[0].split('-')[0].trim().toLowerCase();
  }

  function findPossibleDuplicates(candidateTitle, candidateLocation, candidateCategory) {
    const titleTokens = tokenize(candidateTitle);
    const candidateArea = extractArea(candidateLocation);
    const candidates = [];

    issues.forEach(issue => {
      let isSameCategory = (candidateCategory && issue.category === candidateCategory);
      let issueArea = extractArea(issue.location);
      let isSameArea = candidateArea && issueArea && (candidateArea === issueArea || candidateLocation.toLowerCase().includes(issueArea) || issue.location.toLowerCase().includes(candidateArea));

      // Token overlap
      const issueTokens = tokenize(issue.title);
      let matchCount = 0;
      titleTokens.forEach(t => {
        if (issueTokens.includes(t)) matchCount++;
      });
      let tokenOverlapScore = titleTokens.length > 0 ? (matchCount / titleTokens.length) : 0;

      // Duplicate condition:
      // High match if same area AND same category with some symptom tokens,
      // or very strong token overlap across the board.
      let similarityScore = tokenOverlapScore;
      if (isSameCategory) similarityScore += 0.3;
      if (isSameArea) similarityScore += 0.35;

      if ((isSameArea && isSameCategory && (tokenOverlapScore > 0 || titleTokens.length === 0)) || similarityScore >= 0.55) {
        candidates.push({
          issue,
          score: similarityScore,
          sameArea: isSameArea,
          sameCategory: isSameCategory
        });
      }
    });

    candidates.sort((a, b) => b.score - a.score);
    return candidates;
  }

  // --- Home Page Vitals ---
  function updateHomeVitals() {
    const totalCount = issues.length;
    const submittedCount = issues.filter(i => i.status === 'Submitted').length;
    const wipCount = issues.filter(i => i.status === 'In Progress').length;
    const resolvedCount = issues.filter(i => i.status === 'Resolved').length;

    const elTotal = document.getElementById('vital-total');
    const elSubmitted = document.getElementById('vital-submitted');
    const elWip = document.getElementById('vital-wip');
    const elResolved = document.getElementById('vital-resolved');

    if (elTotal) elTotal.textContent = totalCount;
    if (elSubmitted) elSubmitted.textContent = submittedCount;
    if (elWip) elWip.textContent = wipCount;
    if (elResolved) elResolved.textContent = resolvedCount;

    renderHeroRecentList();
  }

  function renderHeroRecentList() {
    const previewContainer = document.getElementById('hero-recent-issues');
    if (!previewContainer) return;

    const topIssues = issues.slice(0, 3);
    previewContainer.innerHTML = topIssues.map(issue => `
      <div class="preview-item" onclick="window.CampusSetu.openIssueModal('${issue.id}')" style="cursor: pointer;">
        <div class="preview-item-top">
          <span class="cat-badge" data-cat="${issue.category}">
            ${getCategoryIcon(issue.category)} ${issue.category}
          </span>
          <span class="status-badge ${getStatusBadgeClass(issue.status)}">
            ${issue.status}
          </span>
        </div>
        <div class="preview-item-title">${escapeHTML(issue.title)}</div>
        <div class="preview-meta">
          <span>📍 ${escapeHTML(issue.location)}</span>
          <span>▲ ${issue.upvotes} upvotes</span>
        </div>
      </div>
    `).join('');
  }

  // --- Report Issue Logic ---
  let selectedCategory = '';

  function initReportForm() {
    // Render Category selector tiles
    const catGrid = document.getElementById('cat-tiles-grid');
    if (catGrid) {
      catGrid.innerHTML = CATEGORIES_LIST.map(cat => `
        <div class="cat-tile" data-cat="${cat.id}" role="button" tabindex="0">
          <span class="cat-tile-icon">${cat.icon}</span>
          <span class="cat-tile-name">${cat.label}</span>
        </div>
      `).join('');

      catGrid.querySelectorAll('.cat-tile').forEach(tile => {
        tile.addEventListener('click', () => {
          catGrid.querySelectorAll('.cat-tile').forEach(t => t.classList.remove('selected'));
          tile.classList.add('selected');
          selectedCategory = tile.getAttribute('data-cat');
          checkLiveDuplicate();
        });
      });
    }

    // Populate Location Dropdown
    const locSelect = document.getElementById('report-location');
    if (locSelect) {
      locSelect.innerHTML = `<option value="">Select campus zone or building...</option>` +
        CAMPUS_LOCATIONS.map(loc => `<option value="${escapeHTML(loc)}">${escapeHTML(loc)}</option>`).join('');
      locSelect.addEventListener('change', checkLiveDuplicate);
    }

    // Listeners for duplicate & privacy checking
    const titleInput = document.getElementById('report-title');
    if (titleInput) {
      titleInput.addEventListener('input', debounce(checkLiveDuplicate, 250));
    }

    const descInput = document.getElementById('report-desc');
    if (descInput) {
      descInput.addEventListener('input', debounce(checkLivePrivacy, 200));
    }

    // Urgency radio listener styling
    document.querySelectorAll('input[name="urgency"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        document.querySelectorAll('.urgency-radio-label').forEach(lbl => {
          lbl.classList.remove('selected-low', 'selected-medium', 'selected-high');
        });
        const parent = e.target.closest('.urgency-radio-label');
        if (parent) {
          parent.classList.add(`selected-${e.target.value}`);
        }
      });
    });

    // Form Submission
    const form = document.getElementById('issue-report-form');
    if (form) {
      form.addEventListener('submit', handleIssueSubmit);
    }

    // Showcase Pre-fill Buttons
    const btnPrefillDup = document.getElementById('btn-demo-prefill-dup');
    if (btnPrefillDup) {
      btnPrefillDup.addEventListener('click', () => {
        setFormValues({
          category: 'IT & Wi-Fi',
          location: 'Academic Block C, 2nd Floor Corridor',
          title: 'Wi-Fi keeps dropping constantly in Block C 2nd floor',
          desc: 'Students cannot open portals in rooms 205-207. Signal drops every few minutes during practical lectures.',
          urgency: 'high'
        });
        checkLiveDuplicate();
        showToast('Sample duplicate data pre-filled! Check the live alert box.', 'info');
      });
    }

    const btnPrefillPriv = document.getElementById('btn-demo-prefill-priv');
    if (btnPrefillPriv) {
      btnPrefillPriv.addEventListener('click', () => {
        setFormValues({
          category: 'Academic & Labs',
          location: 'Science Block, Physics Lab 1',
          title: 'Left blue notebook in lab, call my phone',
          desc: 'I forgot my physics record on bench 6. If found, please call or WhatsApp 9876501234 or contact roll 23CS012.',
          urgency: 'low'
        });
        checkLivePrivacy();
        showToast('Sample sensitive info pre-filled! Check privacy review alert.', 'info');
      });
    }
  }

  function setFormValues(data) {
    if (data.category) {
      selectedCategory = data.category;
      document.querySelectorAll('.cat-tile').forEach(tile => {
        tile.classList.toggle('selected', tile.getAttribute('data-cat') === data.category);
      });
    }
    const loc = document.getElementById('report-location');
    if (loc && data.location) loc.value = data.location;

    const title = document.getElementById('report-title');
    if (title && data.title) title.value = data.title;

    const desc = document.getElementById('report-desc');
    if (desc && data.desc) desc.value = data.desc;

    if (data.urgency) {
      const radio = document.querySelector(`input[name="urgency"][value="${data.urgency}"]`);
      if (radio) {
        radio.checked = true;
        document.querySelectorAll('.urgency-radio-label').forEach(lbl => {
          lbl.classList.remove('selected-low', 'selected-medium', 'selected-high');
        });
        const parent = radio.closest('.urgency-radio-label');
        if (parent) parent.classList.add(`selected-${data.urgency}`);
      }
    }
  }

  function checkLiveDuplicate() {
    const titleInput = document.getElementById('report-title');
    const locInput = document.getElementById('report-location');
    const alertBox = document.getElementById('live-duplicate-alert');

    if (!titleInput || !alertBox) return;

    const title = titleInput.value.trim();
    const location = locInput ? locInput.value : '';

    if (title.length < 5 && !location) {
      alertBox.style.display = 'none';
      return;
    }

    const duplicates = findPossibleDuplicates(title, location, selectedCategory);

    if (duplicates.length > 0) {
      const topMatch = duplicates[0].issue;
      alertBox.innerHTML = `
        <div class="duplicate-alert-header">
          <span>⚠️ Possible Duplicate Detected (Same Area & Category)</span>
          <span class="demo-tag">DEMO AI GUARD</span>
        </div>
        <div class="duplicate-alert-body">
          An existing report in <strong>${escapeHTML(topMatch.category)}</strong> at <strong>${escapeHTML(topMatch.location)}</strong> was found:<br>
          <strong>#${escapeHTML(topMatch.id)} — "${escapeHTML(topMatch.title)}"</strong> (${topMatch.upvotes} students affected).
        </div>
        <div class="duplicate-actions">
          <button type="button" class="btn btn-sm btn-navy" onclick="window.CampusSetu.upvoteAndRedirect('${topMatch.id}')">
            ▲ Upvote Existing Issue #${escapeHTML(topMatch.id)}
          </button>
          <span style="font-size: 0.75rem; color: #7c2d12;">(Prevents duplicate complaint tickets)</span>
        </div>
      `;
      alertBox.style.display = 'block';
    } else {
      alertBox.style.display = 'none';
    }
  }

  function checkLivePrivacy() {
    const descInput = document.getElementById('report-desc');
    const titleInput = document.getElementById('report-title');
    const alertBox = document.getElementById('live-privacy-alert');

    if (!descInput || !alertBox) return;

    const combined = (titleInput ? titleInput.value : '') + ' ' + descInput.value;
    const findings = scanForPrivacyAndContent(combined);

    if (findings.length > 0) {
      alertBox.innerHTML = `
        <div class="privacy-alert-header">
          <span>🛡️ Flagged for Review: Potential Sensitive / Inappropriate Content</span>
          <span class="demo-tag">SAFEGUARD</span>
        </div>
        <div style="font-size: 0.82rem; line-height: 1.45;">
          Identified: <strong>${findings.join(', ')}</strong>.<br>
          <em>This submission will be flagged for human review and personal telephone/roll numbers will be masked automatically.</em>
        </div>
      `;
      alertBox.style.display = 'block';
    } else {
      alertBox.style.display = 'none';
    }
  }

  function handleIssueSubmit(e) {
    e.preventDefault();

    const titleEl = document.getElementById('report-title');
    const descEl = document.getElementById('report-desc');
    const locEl = document.getElementById('report-location');
    const specificSpotEl = document.getElementById('report-specific-spot');
    const authorEl = document.getElementById('report-author');
    const urgencyEl = document.querySelector('input[name="urgency"]:checked');

    // Validation
    if (!selectedCategory) {
      showToast('Please select an issue category tile.', 'error');
      return;
    }
    if (!locEl || !locEl.value) {
      showToast('Please select a campus building / zone.', 'error');
      return;
    }
    const rawTitle = titleEl ? titleEl.value.trim() : '';
    if (rawTitle.length < 5) {
      showToast('Issue title should be at least 5 characters.', 'error');
      return;
    }
    const rawDesc = descEl ? descEl.value.trim() : '';
    if (rawDesc.length < 15) {
      showToast('Please provide at least 15 characters of descriptive detail.', 'error');
      return;
    }

    // Check duplicate heuristic
    const dupes = findPossibleDuplicates(rawTitle, locEl.value, selectedCategory);
    let isDupe = false;
    let dupeOf = null;
    let dupeReason = null;
    if (dupes.length > 0) {
      isDupe = true;
      dupeOf = dupes[0].issue.id;
      dupeReason = `Automated check: Matches same area (${locEl.value}) and category (${selectedCategory}) as #${dupes[0].issue.id}.`;
    }

    // Check privacy & inappropriate content
    const fullText = rawTitle + ' ' + rawDesc;
    const reviewFindings = scanForPrivacyAndContent(fullText);
    const flaggedForHumanReview = reviewFindings.length > 0;
    const sanitizedTitle = sanitizeSensitiveData(rawTitle);
    const sanitizedDesc = sanitizeSensitiveData(rawDesc);

    // Initial status:
    // If flagged for human review -> "Flagged for Review", otherwise "Submitted"
    const initialStatus = flaggedForHumanReview ? "Flagged for Review" : "Submitted";

    // Location construction
    let fullLocation = locEl.value;
    if (specificSpotEl && specificSpotEl.value.trim()) {
      fullLocation += ` (${specificSpotEl.value.trim()})`;
    }

    const newId = `CS-${100 + issues.length + 1}`;
    const newIssue = {
      id: newId,
      title: sanitizedTitle,
      description: sanitizedDesc,
      category: selectedCategory,
      location: fullLocation,
      urgency: urgencyEl ? urgencyEl.value : 'medium',
      status: initialStatus,
      statusNote: flaggedForHumanReview
        ? `Flagged for human review due to detected ${reviewFindings.join(', ')}. Local demo queue.`
        : 'Submitted to local prototype triage queue. (No claim made that issue is sent to college management).',
      createdAt: new Date().toISOString(),
      displayDate: 'Just now',
      upvotes: 1,
      userUpvoted: true,
      isDuplicate: isDupe,
      duplicateOf: dupeOf,
      duplicateReason: dupeReason,
      hasPrivacyFlag: flaggedForHumanReview,
      flaggedForHumanReview: flaggedForHumanReview,
      reviewReason: flaggedForHumanReview ? `Flagged for human review: contains ${reviewFindings.join(', ')}.` : null,
      author: (authorEl && authorEl.value.trim()) ? escapeHTML(authorEl.value.trim()) : 'Anonymous Student',
      timeline: [
        {
          step: 'Submitted',
          time: 'Just now',
          text: 'Report logged in local triage queue. (DEMO DATA)'
        },
        ...(flaggedForHumanReview ? [{
          step: 'Flagged for Human Review',
          time: 'Just now',
          text: `Automated flag: ${reviewFindings.join(', ')} detected and sanitized.`
        }] : []),
        ...(isDupe ? [{
          step: 'Duplicate Heuristic Flag',
          time: 'Just now',
          text: `Flagged as possible duplicate of #${dupeOf} (same area and category).`
        }] : [])
      ]
    };

    issues.unshift(newIssue);
    saveIssues();

    // Reset Form
    e.target.reset();
    selectedCategory = '';
    document.querySelectorAll('.cat-tile').forEach(t => t.classList.remove('selected'));
    const alertDup = document.getElementById('live-duplicate-alert');
    const alertPriv = document.getElementById('live-privacy-alert');
    if (alertDup) alertDup.style.display = 'none';
    if (alertPriv) alertPriv.style.display = 'none';

    // Show confirmation modal
    openSubmissionSuccessModal(newIssue);
  }

  function openSubmissionSuccessModal(issue) {
    const modal = document.getElementById('issue-modal');
    const modalBody = document.getElementById('modal-body-content');
    const modalTitle = document.getElementById('modal-title');

    if (!modal || !modalBody) return;

    modalTitle.textContent = `Report Added to Issue Hub: #${issue.id}`;
    modalBody.innerHTML = `
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <div style="width: 58px; height: 58px; background: var(--teal-50); color: var(--teal-600); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 0.75rem auto; border: 2px solid var(--teal-200);">
          ✓
        </div>
        <h3 style="color: var(--navy-900); font-size: 1.35rem; margin-bottom: 0.35rem;">Issue Registered Successfully</h3>
        <p style="color: var(--slate-600); font-size: 0.9rem;">
          Your issue has been added to the <strong>Issue Hub</strong> with tracking ID <strong>#${escapeHTML(issue.id)}</strong>.
        </p>
        <span class="demo-tag demo-tag-dark" style="margin-top: 0.25rem;">DEMO DATA</span>
      </div>

      <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.25rem; font-size: 0.88rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
          <span style="color: var(--slate-500);">Category:</span>
          <strong>${escapeHTML(issue.category)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
          <span style="color: var(--slate-500);">Location:</span>
          <strong>${escapeHTML(issue.location)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
          <span style="color: var(--slate-500);">Initial Status:</span>
          <span class="status-badge ${getStatusBadgeClass(issue.status)}">${escapeHTML(issue.status)}</span>
        </div>
        ${issue.isDuplicate ? `
          <div style="margin-top: 0.6rem; padding: 0.5rem; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 4px; font-size: 0.8rem; color: #9a3412;">
            ⚠️ <strong>Possible Duplicate:</strong> Linked with #${escapeHTML(issue.duplicateOf)} from the same area and category.
          </div>
        ` : ''}
        ${issue.flaggedForHumanReview ? `
          <div style="margin-top: 0.6rem; padding: 0.5rem; background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 4px; font-size: 0.8rem; color: #9d174d;">
            🛡️ <strong>Flagged for Human Review:</strong> Potential personal info or sensitive content was detected and redacted.
          </div>
        ` : ''}
      </div>

      <div class="ethical-callout">
        <div>⚖️</div>
        <div>
          <strong>Transparency Notice:</strong><br>
          CampusSetu / CampusCare is a local demonstration prototype. Issues are added to our prototype queue and are 
          <strong>not claimed to have been sent to college management or resolved</strong> without genuine physical confirmation.
        </div>
      </div>
    `;

    const modalFooter = document.getElementById('modal-footer-actions');
    if (modalFooter) {
      modalFooter.innerHTML = `
        <button type="button" class="btn btn-outline" onclick="window.CampusSetu.closeModal()">Close</button>
        <button type="button" class="btn btn-primary" onclick="window.CampusSetu.closeModal(); window.CampusSetu.navigateTo('hub');">
          View in Issue Hub →
        </button>
      `;
    }

    modal.classList.add('active');
  }

  // --- Interactive Status Transition Logic ---
  const ALLOWED_STATUSES = ['Submitted', 'In Progress', 'Resolved', 'Flagged for Review'];

  function changeIssueStatus(id, newStatus) {
    if (!ALLOWED_STATUSES.includes(newStatus)) {
      showToast(`Invalid status: ${newStatus}`, 'error');
      return;
    }

    const issue = issues.find(i => i.id === id);
    if (!issue) {
      showToast(`Issue #${id} not found`, 'error');
      return;
    }

    const oldStatus = issue.status;
    if (oldStatus === newStatus) return;

    issue.status = newStatus;
    issue.statusNote = `Status changed to ${newStatus}. Local prototype triage simulation.`;

    // Append to timeline
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    issue.timeline.push({
      step: newStatus,
      time: `Today at ${nowTime}`,
      text: `Status updated from "${oldStatus}" to "${newStatus}". (DEMO DATA)`
    });

    saveIssues();

    // Refresh UI reactivity
    if (currentPage === 'hub') {
      applyHubFilters();
    } else if (currentPage === 'insights') {
      renderInsights();
    } else if (currentPage === 'home') {
      updateHomeVitals();
    }

    showToast(`Status of #${id} updated to "${newStatus}"!`, 'success');
  }

  // --- Export to CSV Feature ---
  function exportToCSV() {
    if (!issues || issues.length === 0) {
      showToast('No issues available to export.', 'warning');
      return;
    }

    const headers = [
      'Issue ID',
      'Category',
      'Title',
      'Location',
      'Urgency',
      'Status',
      'Upvotes',
      'Is Duplicate',
      'Duplicate Of',
      'Flagged For Review',
      'Reported Date',
      'Author'
    ];

    const rows = issues.map(issue => [
      `"${issue.id}"`,
      `"${(issue.category || '').replace(/"/g, '""')}"`,
      `"${(issue.title || '').replace(/"/g, '""')}"`,
      `"${(issue.location || '').replace(/"/g, '""')}"`,
      `"${issue.urgency || 'medium'}"`,
      `"${issue.status || 'Submitted'}"`,
      issue.upvotes || 0,
      issue.isDuplicate ? 'YES' : 'NO',
      `"${issue.duplicateOf || 'N/A'}"`,
      issue.flaggedForHumanReview ? 'YES' : 'NO',
      `"${issue.createdAt || ''}"`,
      `"${(issue.author || 'Anonymous').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', url);
    downloadLink.setAttribute('download', `campuscare_issues_DEMO_DATA_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);

    showToast('Exported DEMO DATA to CSV successfully!', 'success');
  }

  // --- Smart Issue Hub Logic ---
  let activeCategoryFilter = 'all';
  let activeStatusFilter = 'all';
  let filterDuplicatesOnly = false;
  let filterHumanReviewOnly = false;
  let activeSort = 'upvotes';
  let activeSearchTerm = '';

  function initHubControls() {
    // Search input
    const searchInput = document.getElementById('hub-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', debounce((e) => {
        activeSearchTerm = e.target.value.toLowerCase().trim();
        applyHubFilters();
      }, 200));
    }

    // Category filter pills
    const catPillsContainer = document.getElementById('hub-category-pills');
    if (catPillsContainer) {
      const pills = [
        { id: 'all', label: 'All Categories' },
        ...CATEGORIES_LIST.map(c => ({ id: c.id, label: `${c.icon} ${c.label}` }))
      ];
      catPillsContainer.innerHTML = pills.map(p => `
        <button type="button" class="filter-btn ${p.id === 'all' ? 'active' : ''}" data-cat="${p.id}">
          ${p.label}
        </button>
      `).join('');

      catPillsContainer.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          catPillsContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          activeCategoryFilter = btn.getAttribute('data-cat');
          applyHubFilters();
        });
      });
    }

    // Status filter dropdown
    const statusSelect = document.getElementById('hub-status-filter');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        activeStatusFilter = e.target.value;
        applyHubFilters();
      });
    }

    // Checkboxes
    const checkDupes = document.getElementById('filter-duplicates-only');
    if (checkDupes) {
      checkDupes.addEventListener('change', (e) => {
        filterDuplicatesOnly = e.target.checked;
        applyHubFilters();
      });
    }

    const checkReview = document.getElementById('filter-privacy-only');
    if (checkReview) {
      checkReview.addEventListener('change', (e) => {
        filterHumanReviewOnly = e.target.checked;
        applyHubFilters();
      });
    }

    // Sort select
    const sortSelect = document.getElementById('hub-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        activeSort = e.target.value;
        applyHubFilters();
      });
    }

    // Export to CSV button in Hub
    const btnExportCSV = document.getElementById('btn-export-csv');
    if (btnExportCSV) {
      btnExportCSV.addEventListener('click', exportToCSV);
    }
  }

  function applyHubFilters() {
    const container = document.getElementById('hub-issues-list');
    const counterEl = document.getElementById('hub-results-count');
    if (!container) return;

    let filtered = issues.filter(issue => {
      // Category filter
      if (activeCategoryFilter !== 'all' && issue.category !== activeCategoryFilter) {
        return false;
      }
      // Status filter
      if (activeStatusFilter !== 'all' && issue.status !== activeStatusFilter) {
        return false;
      }
      // Duplicates toggle
      if (filterDuplicatesOnly && !issue.isDuplicate) {
        return false;
      }
      // Flagged for human review toggle
      if (filterHumanReviewOnly && !issue.flaggedForHumanReview && !issue.hasPrivacyFlag) {
        return false;
      }
      // Search term
      if (activeSearchTerm) {
        const matchTitle = (issue.title || '').toLowerCase().includes(activeSearchTerm);
        const matchDesc = (issue.description || '').toLowerCase().includes(activeSearchTerm);
        const matchLoc = (issue.location || '').toLowerCase().includes(activeSearchTerm);
        const matchId = (issue.id || '').toLowerCase().includes(activeSearchTerm);
        if (!matchTitle && !matchDesc && !matchLoc && !matchId) {
          return false;
        }
      }
      return true;
    });

    // Sort
    if (activeSort === 'upvotes') {
      filtered.sort((a, b) => b.upvotes - a.upvotes);
    } else if (activeSort === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (activeSort === 'urgency') {
      const order = { high: 3, medium: 2, low: 1 };
      filtered.sort((a, b) => (order[b.urgency] || 1) - (order[a.urgency] || 1));
    }

    if (counterEl) {
      counterEl.innerHTML = `Showing <strong>${filtered.length}</strong> of <strong>${issues.length}</strong> campus reports <span class="demo-tag" style="margin-left: 0.5rem;">DEMO DATA</span>`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box">
          <div class="empty-state-icon">🔍</div>
          <h3 class="empty-state-title">No matching campus reports found</h3>
          <p class="empty-state-text">
            No issues matched your search filters. Try clearing your search keyword or switching category tabs.
          </p>
          <button type="button" class="btn btn-outline" onclick="window.CampusSetu.resetHubFilters()">
            Clear All Filters
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(issue => `
      <div class="issue-card" id="card-${issue.id}">
        <div class="issue-card-top">
          <div class="issue-card-top-left">
            <span class="demo-tag">DEMO DATA</span>
            <span class="cat-badge" data-cat="${issue.category}">
              ${getCategoryIcon(issue.category)} ${issue.category}
            </span>
            <span class="urgency-badge urgency-${issue.urgency}">
              <span class="urgency-dot"></span> ${issue.urgency} urgency
            </span>
          </div>
          <span class="issue-id">#${issue.id}</span>
        </div>

        <h3 class="issue-title">${escapeHTML(issue.title)}</h3>

        <div class="issue-location">
          <span>📍</span>
          <span>${escapeHTML(issue.location)}</span>
          <span style="color: var(--slate-300); margin: 0 0.25rem;">•</span>
          <span>${escapeHTML(issue.displayDate || 'Recently')}</span>
        </div>

        <p class="issue-desc">${escapeHTML(issue.description)}</p>

        <!-- Flags Box -->
        ${(issue.isDuplicate || issue.flaggedForHumanReview) ? `
          <div class="issue-flags-box">
            ${issue.isDuplicate ? `
              <div class="flag-alert-strip duplicate">
                <span>⚠️</span>
                <div>
                  <strong>Possible Duplicate:</strong> Linked with #${escapeHTML(issue.duplicateOf)} (same area & category). ${escapeHTML(issue.duplicateReason || '')}
                </div>
              </div>
            ` : ''}
            ${issue.flaggedForHumanReview ? `
              <div class="flag-alert-strip privacy">
                <span>🛡️</span>
                <div>
                  <strong>Flagged for Human Review:</strong> ${escapeHTML(issue.reviewReason || 'Potential personal info or inappropriate content flagged.')}
                </div>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Interactive Status Transition Bar on Card -->
        <div class="status-change-strip">
          <label class="status-change-label">Change Status:</label>
          <select 
            class="status-change-select" 
            onchange="window.CampusSetu.changeIssueStatus('${issue.id}', this.value)"
            aria-label="Change status for issue #${issue.id}"
          >
            <option value="Submitted" ${issue.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
            <option value="In Progress" ${issue.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Resolved" ${issue.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
            <option value="Flagged for Review" ${issue.status === 'Flagged for Review' ? 'selected' : ''}>Flagged for Review</option>
          </select>
        </div>

        <div class="issue-card-footer">
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <button 
              type="button" 
              class="upvote-btn ${issue.userUpvoted ? 'upvoted' : ''}" 
              onclick="window.CampusSetu.toggleUpvote('${issue.id}')"
              aria-label="Upvote this report"
            >
              <span class="upvote-icon">${issue.userUpvoted ? '▲' : '△'}</span>
              <span>${issue.upvotes}</span>
              <span style="font-weight: 400; font-size: 0.75rem;">${issue.userUpvoted ? 'Upvoted' : 'Facing this'}</span>
            </button>
            <span class="status-badge ${getStatusBadgeClass(issue.status)}" title="${escapeHTML(issue.statusNote || '')}">
              ${escapeHTML(issue.status)}
            </span>
          </div>

          <button 
            type="button" 
            class="btn-view-details" 
            onclick="window.CampusSetu.openIssueModal('${issue.id}')"
          >
            Details & Verification →
          </button>
        </div>
      </div>
    `).join('');
  }

  function resetHubFilters() {
    activeCategoryFilter = 'all';
    activeStatusFilter = 'all';
    filterDuplicatesOnly = false;
    filterHumanReviewOnly = false;
    activeSearchTerm = '';
    activeSort = 'upvotes';

    const searchInput = document.getElementById('hub-search-input');
    if (searchInput) searchInput.value = '';

    const checkDup = document.getElementById('filter-duplicates-only');
    if (checkDup) checkDup.checked = false;

    const checkRev = document.getElementById('filter-privacy-only');
    if (checkRev) checkRev.checked = false;

    const statusSelect = document.getElementById('hub-status-filter');
    if (statusSelect) statusSelect.value = 'all';

    const sortSelect = document.getElementById('hub-sort-select');
    if (sortSelect) sortSelect.value = 'upvotes';

    const catPills = document.getElementById('hub-category-pills');
    if (catPills) {
      catPills.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-cat') === 'all');
      });
    }

    applyHubFilters();
    showToast('All filters reset.', 'info');
  }

  // --- Upvote Functionality ---
  function toggleUpvote(id) {
    const issue = issues.find(i => i.id === id);
    if (!issue) return;

    if (issue.userUpvoted) {
      issue.upvotes = Math.max(0, issue.upvotes - 1);
      issue.userUpvoted = false;
      showToast(`Removed your vote for #${id}.`, 'info');
    } else {
      issue.upvotes += 1;
      issue.userUpvoted = true;
      showToast(`Vote recorded for #${id}! Thanks for confirming this issue.`, 'success');
    }

    saveIssues();

    if (currentPage === 'hub') {
      applyHubFilters();
    } else if (currentPage === 'home') {
      updateHomeVitals();
    }
  }

  function upvoteAndRedirect(id) {
    toggleUpvote(id);
    navigateTo('hub');
    setTimeout(() => {
      const card = document.getElementById(`card-${id}`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.borderColor = 'var(--teal-500)';
        card.style.boxShadow = '0 0 15px rgba(20, 184, 166, 0.4)';
      }
    }, 300);
  }

  // --- Issue Details & Modal ---
  function openIssueModal(id) {
    const issue = issues.find(i => i.id === id);
    if (!issue) return;

    const modal = document.getElementById('issue-modal');
    const modalBody = document.getElementById('modal-body-content');
    const modalTitle = document.getElementById('modal-title');

    if (!modal || !modalBody) return;

    modalTitle.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
        <span>Report #${issue.id}</span>
        <span class="demo-tag">DEMO DATA</span>
        <span class="cat-badge" data-cat="${issue.category}">
          ${getCategoryIcon(issue.category)} ${issue.category}
        </span>
      </div>
    `;

    modalBody.innerHTML = `
      <div style="margin-bottom: 1.25rem;">
        <h3 style="font-size: 1.25rem; color: var(--navy-900); margin-bottom: 0.5rem; line-height: 1.35;">
          ${escapeHTML(issue.title)}
        </h3>
        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--slate-500); flex-wrap: wrap;">
          <span>📍 <strong>Location:</strong> ${escapeHTML(issue.location)}</span>
          <span>•</span>
          <span>👤 <strong>Logged by:</strong> ${escapeHTML(issue.author || 'Anonymous Student')}</span>
          <span>•</span>
          <span>🕒 <strong>Reported:</strong> ${escapeHTML(issue.displayDate || 'Recently')}</span>
        </div>
      </div>

      <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 1.15rem; margin-bottom: 1.25rem;">
        <h4 style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--slate-500); margin-bottom: 0.4rem;">
          Problem Description
        </h4>
        <p style="color: var(--slate-800); font-size: 0.95rem; margin: 0; line-height: 1.6;">
          ${escapeHTML(issue.description)}
        </p>
      </div>

      ${issue.isDuplicate ? `
        <div class="flag-alert-strip duplicate" style="margin-bottom: 1rem; padding: 0.75rem;">
          <div style="font-size: 1.1rem;">⚠️</div>
          <div>
            <strong>CampusSetu / CampusCare Duplicate Advisory:</strong><br>
            Shares the same area and category with parent report 
            <strong>#${escapeHTML(issue.duplicateOf)}</strong>. ${escapeHTML(issue.duplicateReason || '')}
          </div>
        </div>
      ` : ''}

      ${issue.flaggedForHumanReview ? `
        <div class="flag-alert-strip privacy" style="margin-bottom: 1rem; padding: 0.75rem;">
          <div style="font-size: 1.1rem;">🛡️</div>
          <div>
            <strong>Flagged for Human Review:</strong><br>
            ${escapeHTML(issue.reviewReason || 'Potential personal info or sensitive content flagged for review.')}.
          </div>
        </div>
      ` : ''}

      <!-- Interactive Status Selector in Modal -->
      <div style="background: #f8fafc; border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.25rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.65rem; flex-wrap: wrap; gap: 0.5rem;">
          <span style="font-size: 0.85rem; font-weight: 700; color: var(--navy-900); text-transform: uppercase;">
            Interactive Status Updater (DEMO)
          </span>
          <select 
            class="status-change-select" 
            style="font-size: 0.85rem; padding: 0.35rem 0.65rem;"
            onchange="window.CampusSetu.changeIssueStatus('${issue.id}', this.value); window.CampusSetu.openIssueModal('${issue.id}');"
          >
            <option value="Submitted" ${issue.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
            <option value="In Progress" ${issue.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Resolved" ${issue.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
            <option value="Flagged for Review" ${issue.status === 'Flagged for Review' ? 'selected' : ''}>Flagged for Review</option>
          </select>
        </div>
        <p style="font-size: 0.84rem; color: var(--slate-600); margin: 0; line-height: 1.5;">
          ${escapeHTML(issue.statusNote || '')}
        </p>
      </div>

      <!-- Timeline Tracking -->
      <h4 style="font-size: 0.92rem; color: var(--navy-900); margin-bottom: 0.65rem;">
        Verification Timeline (Demonstration)
      </h4>
      <div class="timeline-container">
        ${(issue.timeline || []).map(step => `
          <div class="timeline-step">
            <div class="timeline-dot"></div>
            <div class="timeline-step-title">${escapeHTML(step.step)}</div>
            <div class="timeline-step-time">${escapeHTML(step.time)}</div>
            <div class="timeline-step-note">${escapeHTML(step.text)}</div>
          </div>
        `).join('')}
      </div>

      <div class="ethical-callout">
        <div>⚖️</div>
        <div>
          <strong>Integrity & Ethics Notice:</strong><br>
          CampusSetu / CampusCare is a local hackathon demonstration prototype. 
          Issues are not claimed to be sent to college management or resolved without physical verification.
        </div>
      </div>
    `;

    const modalFooter = document.getElementById('modal-footer-actions');
    if (modalFooter) {
      modalFooter.innerHTML = `
        <button 
          type="button" 
          class="btn btn-outline" 
          onclick="window.CampusSetu.toggleUpvote('${issue.id}'); window.CampusSetu.openIssueModal('${issue.id}');"
        >
          ${issue.userUpvoted ? '▲ Upvoted (' + issue.upvotes + ')' : '△ Upvote Issue (' + issue.upvotes + ')'}
        </button>
        <button type="button" class="btn btn-navy" onclick="window.CampusSetu.closeModal()">Close</button>
      `;
    }

    modal.classList.add('active');
  }

  function closeModal() {
    const modal = document.getElementById('issue-modal');
    if (modal) modal.classList.remove('active');
  }

  // --- Community Insights Analytics (Updates Reactively) ---
  function renderInsights() {
    const total = issues.length || 1;

    // 1. Reactive KPI counts
    const countSubmitted = issues.filter(i => i.status === 'Submitted').length;
    const countWIP = issues.filter(i => i.status === 'In Progress').length;
    const countResolved = issues.filter(i => i.status === 'Resolved').length;
    const countReview = issues.filter(i => i.status === 'Flagged for Review' || i.flaggedForHumanReview).length;
    const countDupes = issues.filter(i => i.isDuplicate).length;

    const elSub = document.getElementById('insight-kpi-submitted');
    const elWip = document.getElementById('insight-kpi-wip');
    const elRes = document.getElementById('insight-kpi-resolved');
    const elRev = document.getElementById('kpi-privacy-redacted');
    const elDup = document.getElementById('kpi-dupes-prevented');

    if (elSub) elSub.textContent = countSubmitted;
    if (elWip) elWip.textContent = countWIP;
    if (elRes) elRes.textContent = countResolved;
    if (elRev) elRev.textContent = countReview;
    if (elDup) elDup.textContent = countDupes;

    // 2. Category Summary Progress Bars
    const catContainer = document.getElementById('category-summary-bars');
    if (catContainer) {
      const counts = {};
      CATEGORIES_LIST.forEach(c => { counts[c.id] = 0; });

      issues.forEach(issue => {
        if (counts[issue.category] !== undefined) {
          counts[issue.category]++;
        }
      });

      catContainer.innerHTML = CATEGORIES_LIST.map(cat => {
        const count = counts[cat.id] || 0;
        const pct = Math.round((count / total) * 100);
        return `
          <div class="cat-bar-item">
            <div class="cat-bar-labels">
              <span>${cat.icon} ${cat.label}</span>
              <span>${count} issues (${pct}%)</span>
            </div>
            <div class="cat-bar-track">
              <div class="cat-bar-fill" style="width: ${pct}%; background-color: ${cat.color};"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 3. Status Donut
    renderStatusDonut();

    // 4. Hotspots
    renderCampusHotspots();
  }

  function renderStatusDonut() {
    const donutSvg = document.getElementById('donut-svg');
    const donutLegend = document.getElementById('donut-legend');
    if (!donutSvg || !donutLegend) return;

    const total = issues.length || 1;
    const statusCounts = {
      'Submitted': 0,
      'In Progress': 0,
      'Resolved': 0,
      'Flagged for Review': 0
    };

    issues.forEach(i => {
      if (statusCounts[i.status] !== undefined) {
        statusCounts[i.status]++;
      } else {
        statusCounts['Submitted']++;
      }
    });

    const statusConfig = [
      { key: 'Submitted', color: '#f59e0b', label: 'Submitted' },
      { key: 'In Progress', color: '#8b5cf6', label: 'In Progress' },
      { key: 'Resolved', color: '#10b981', label: 'Resolved' },
      { key: 'Flagged for Review', color: '#ef4444', label: 'Flagged for Review' }
    ];

    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    let accumulatedAngle = 0;

    let svgCircles = '';
    let legendItems = '';

    statusConfig.forEach(cfg => {
      const count = statusCounts[cfg.key] || 0;
      const fraction = count / total;
      const strokeLength = fraction * circumference;
      const strokeDashoffset = -accumulatedAngle;
      accumulatedAngle += strokeLength;

      if (fraction > 0) {
        svgCircles += `
          <circle 
            cx="50" 
            cy="50" 
            r="${radius}" 
            fill="transparent" 
            stroke="${cfg.color}" 
            stroke-width="14" 
            stroke-dasharray="${strokeLength.toFixed(1)} ${(circumference - strokeLength).toFixed(1)}" 
            stroke-dashoffset="${strokeDashoffset.toFixed(1)}"
          />
        `;
      }

      legendItems += `
        <div class="legend-item">
          <div class="legend-color-dot" style="background-color: ${cfg.color};"></div>
          <span><strong>${count}</strong> ${cfg.label}</span>
        </div>
      `;
    });

    donutSvg.innerHTML = `
      <svg viewBox="0 0 100 100" width="100%" height="100%" style="transform: rotate(-90deg);">
        ${svgCircles}
        <circle cx="50" cy="50" r="28" fill="#ffffff" />
      </svg>
      <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; pointer-events: none;">
        <span style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700; color: var(--navy-900); line-height: 1;">${total}</span>
        <span style="font-size: 0.65rem; color: var(--slate-400); text-transform: uppercase;">Total</span>
      </div>
    `;

    donutLegend.innerHTML = legendItems;
  }

  function renderCampusHotspots() {
    const container = document.getElementById('campus-hotspots-grid');
    if (!container) return;

    const locationMap = {};
    issues.forEach(i => {
      let zone = (i.location || '').split(',')[0].split('-')[0].trim();
      if (!zone) zone = 'General Campus';
      if (!locationMap[zone]) locationMap[zone] = 0;
      locationMap[zone]++;
    });

    const sortedZones = Object.entries(locationMap).sort((a, b) => b[1] - a[1]);

    container.innerHTML = sortedZones.map(([zone, count]) => {
      let heatClass = 'heat-low';
      let heatLabel = 'Low Activity';
      if (count >= 3) {
        heatClass = 'heat-high';
        heatLabel = 'High Hotspot';
      } else if (count >= 2) {
        heatClass = 'heat-medium';
        heatLabel = 'Moderate';
      }

      return `
        <div class="zone-tile">
          <div class="zone-info">
            <span class="zone-name">${escapeHTML(zone)}</span>
            <span class="zone-issues-count">${count} active ${count === 1 ? 'report' : 'reports'} logged</span>
          </div>
          <span class="zone-heat-pill ${heatClass}">${heatLabel}</span>
        </div>
      `;
    }).join('');
  }

  // --- Toast Notification System ---
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'warning' ? 'toast-warning' : ''}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${escapeHTML(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }

  // --- Helper Utilities ---
  function getCategoryIcon(cat) {
    const item = CATEGORIES_LIST.find(c => c.id === cat);
    return item ? item.icon : '📌';
  }

  function getStatusBadgeClass(status) {
    switch (status) {
      case 'Submitted': return 'status-pending';
      case 'In Progress': return 'status-wip';
      case 'Resolved': return 'status-resolved';
      case 'Flagged for Review': return 'status-flagged';
      default: return 'status-pending';
    }
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function debounce(fn, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function renderAllViews() {
    updateHomeVitals();
    applyHubFilters();
    renderInsights();
  }

  // --- Global Event Listeners ---
  function setupGlobalListeners() {
    // Navigation clicks
    document.querySelectorAll('[data-nav-target]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const target = el.getAttribute('data-nav-target');
        navigateTo(target);
      });
    });

    // Mobile menu toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    if (mobileBtn && navMenu) {
      mobileBtn.addEventListener('click', () => {
        navMenu.classList.toggle('open');
      });
    }

    // Modal Close
    const modalClose = document.getElementById('modal-close-btn');
    const modal = document.getElementById('issue-modal');
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    // Hash change
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (pages.includes(hash) && hash !== currentPage) {
        navigateTo(hash);
      }
    });

    // Reset demo button in banner
    const btnResetDemo = document.getElementById('btn-reset-demo');
    if (btnResetDemo) {
      btnResetDemo.addEventListener('click', resetDemoData);
    }
  }

  // --- App Initialization ---
  function initApp() {
    loadIssues();
    initReportForm();
    initHubControls();
    setupGlobalListeners();

    const initialHash = window.location.hash.replace('#', '');
    if (pages.includes(initialHash)) {
      navigateTo(initialHash);
    } else {
      navigateTo('home');
    }
  }

  // Public API exposed on window.CampusSetu
  window.CampusSetu = {
    navigateTo,
    openIssueModal,
    closeModal,
    toggleUpvote,
    upvoteAndRedirect,
    changeIssueStatus,
    exportToCSV,
    resetHubFilters,
    resetDemoData,
    getIssues: () => issues
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
