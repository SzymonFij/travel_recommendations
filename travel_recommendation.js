(function () {
    'use strict';
  
    const API_URL = 'travel_recommendation_api.json';
    let recommendationsData = null;
  
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultsList = document.getElementById('resultsList');
    const resultsTime = document.getElementById('resultsTime');
    const resultsContainer = document.getElementById('resultsContainer');
    const navSearch = document.getElementById('navSearch');
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
  
    // Keyword mapping: normalized keyword -> API category
    const KEYWORD_MAP = {
      beach: 'beaches',
      beaches: 'beaches',
      temple: 'temples',
      temples: 'temples',
      country: 'countries',
      countries: 'countries'
    };
  
    function normalizeKeyword(input) {
      if (!input || typeof input !== 'string') return '';
      return input.trim().toLowerCase();
    }
  
    function getCategoryForKeyword(keyword) {
      return KEYWORD_MAP[keyword] || null;
    }
  
    function fetchRecommendations() {
      return fetch(API_URL)
        .then(function (res) {
          if (!res.ok) throw new Error('Failed to load recommendations');
          return res.json();
        })
        .then(function (data) {
          recommendationsData = data;
          console.log('Recommendations data loaded:', recommendationsData);
          return data;
        })
        .catch(function (err) {
          console.error('Error fetching recommendations:', err);
          recommendationsData = null;
          throw err;
        });
    }
  
    function getRecommendations(category) {
      if (!recommendationsData) return [];
      const list = recommendationsData[category];
      return Array.isArray(list) ? list : [];
    }
  
    function renderResults(items) {
      if (!items || items.length === 0) {
        resultsList.innerHTML = '<p>No recommendations found. Try "beach", "temple", or "country".</p>';
        resultsTime.textContent = '';
        return;
      }
  
      resultsList.innerHTML = items
        .map(function (item) {
          const imgSrc = item.imageUrl || 'images/placeholder.jpg';
          const name = item.name || 'Destination';
          const desc = item.description || '';
          const safeName = name.replace(/"/g, '&quot;');
          const safeDesc = desc.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          return (
            '<div class="result-card">' +
            '<img src="' + imgSrc + '" alt="' + safeName + '" onerror="this.src=\'https://placehold.co/200x160?text=Photo\'">' +
            '<div class="card-body">' +
            '<h3>' + safeName + '</h3>' +
            '<p>' + safeDesc + '</p>' +
            '</div>' +
            '</div>'
          );
        })
        .join('');
  
      // Optional: display time in recommended destinations (first timezone found)
      const firstWithTz = items.find(function (i) { return i.timezone; });
      if (firstWithTz && firstWithTz.timezone) {
        try {
          const now = new Date();
          const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: firstWithTz.timezone,
            timeStyle: 'long',
            dateStyle: 'short'
          });
          resultsTime.textContent = 'Local time in ' + firstWithTz.name + ': ' + formatter.format(now);
        } catch (e) {
          resultsTime.textContent = '';
        }
      } else {
        resultsTime.textContent = '';
      }
    }
  
    function clearResults() {
      resultsList.innerHTML = '';
      resultsTime.textContent = '';
      if (searchInput) searchInput.value = '';
    }
  
    function doSearch() {
      const raw = searchInput ? searchInput.value : '';
      const keyword = normalizeKeyword(raw);
      const category = getCategoryForKeyword(keyword);
  
      if (!category) {
        resultsList.innerHTML = '<p>Try searching for "beach", "temple", or "country".</p>';
        resultsTime.textContent = '';
        return;
      }
  
      const items = getRecommendations(category);
      renderResults(items);
    }
  
    function showPage(pageId) {
      pageId = pageId || 'home';
      pages.forEach(function (page) {
        page.classList.toggle('active', page.id === pageId);
      });
      if (navSearch) {
        navSearch.style.display = pageId === 'home' ? '' : 'none';
      }
    }
  
    function initNavigation() {
      navLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          var page = link.getAttribute('data-page') || link.getAttribute('href').replace('#', '');
          showPage(page);
        });
      });
  
      // Show/hide search bar by page (navbar without search on About & Contact)
      window.addEventListener('hashchange', function () {
        var hash = (window.location.hash || '#home').replace('#', '');
        showPage(hash || 'home');
      });
      var initialHash = (window.location.hash || '#home').replace('#', '');
      showPage(initialHash || 'home');
    }
  
    function initContactForm() {
      var form = document.getElementById('contactForm');
      if (!form) return;
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        clearResults();
        alert('Thank you! Your message has been submitted.');
        form.reset();
      });
    }
  
    function init() {
      fetchRecommendations();
  
      if (searchBtn) searchBtn.addEventListener('click', doSearch);
      if (resetBtn) resetBtn.addEventListener('click', clearResults);
      if (searchInput) {
        searchInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            doSearch();
          }
        });
      }
  
      initNavigation();
      initContactForm();
    }
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();
  