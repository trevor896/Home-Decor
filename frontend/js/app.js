"use strict";

const scrollRevealTargets = document.querySelectorAll(
	[
		".hero-copy",
		".latest-work-heading",
		".work-card",
		".why-home-intro",
		".why-item",
		".testimonials-heading",
		".about-section",
		".work-process-heading",
		".process-step",
		".goals-vision-heading",
		".goals-vision-item",
		".services-intro",
		".service-card",
		".services-contact-copy",
		".services-contact-actions",
		".faq-intro",
		".faq-item",
		".catalog-card",
		".catalog-pagination",
		".page-content > *",
	].join(", "),
);

if (
	"IntersectionObserver" in window &&
	!window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
	document.documentElement.classList.add("scroll-animations");

	const scrollObserver = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				entry.target.classList.toggle("is-visible", entry.isIntersecting);
			});
		},
		{ threshold: 0.15 },
	);

	scrollRevealTargets.forEach((target) => {
		target.classList.add("scroll-reveal");
		scrollObserver.observe(target);
	});
}

document.querySelectorAll(".menu-toggle").forEach((toggle) => {
	const menu = document.getElementById(toggle.getAttribute("aria-controls"));
	const header = toggle.closest(".site-header");

	const setMenuOpen = (isOpen) => {
		toggle.setAttribute("aria-expanded", String(isOpen));
		toggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
		menu.classList.toggle("is-open", isOpen);
	};

	toggle.addEventListener("click", () => {
		setMenuOpen(toggle.getAttribute("aria-expanded") !== "true");
	});

	menu.querySelectorAll("a").forEach((link) => {
		link.addEventListener("click", () => setMenuOpen(false));
	});

	document.addEventListener("click", (event) => {
		if (!header.contains(event.target)) {
			setMenuOpen(false);
		}
	});

	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
			setMenuOpen(false);
			toggle.focus();
		}
	});

	window.matchMedia("(min-width: 761px)").addEventListener("change", (event) => {
		if (event.matches) {
			setMenuOpen(false);
		}
	});
});

const testimonialCarousel = document.querySelector(".testimonial-carousel");

if (testimonialCarousel) {
	const viewport = testimonialCarousel.querySelector(".testimonial-viewport");
	const track = testimonialCarousel.querySelector(".testimonial-track");
	const slides = [...testimonialCarousel.querySelectorAll(".testimonial-slide")];
	let activeSlide = 0;
	let pointerStart = null;
	let activePointer = null;

	const showSlide = (index) => {
		activeSlide = (index + slides.length) % slides.length;

		slides.forEach((slide, slideIndex) => {
			const previousIndex = (activeSlide - 1 + slides.length) % slides.length;
			const nextIndex = (activeSlide + 1) % slides.length;
			slide.classList.toggle("is-active", slideIndex === activeSlide);
			slide.classList.toggle("is-previous", slideIndex === previousIndex);
			slide.classList.toggle("is-next", slideIndex === nextIndex);
			slide.setAttribute("aria-hidden", String(slideIndex !== activeSlide));
		});

	};

	viewport.addEventListener("pointerdown", (event) => {
		if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) {
			return;
		}

		pointerStart = event.clientX;
		activePointer = event.pointerId;
		track.classList.add("is-dragging");
		viewport.setPointerCapture(activePointer);
	});

	viewport.addEventListener("pointermove", (event) => {
		if (event.pointerId !== activePointer || pointerStart === null) {
			return;
		}

		track.style.transform = `translateX(${event.clientX - pointerStart}px)`;
	});

	const finishDrag = (event) => {
		if (event.pointerId !== activePointer || pointerStart === null) {
			return;
		}

		const distance = event.clientX - pointerStart;
		const threshold = Math.max(42, viewport.clientWidth * 0.06);
		track.classList.remove("is-dragging");

		if (Math.abs(distance) >= threshold) {
			showSlide(activeSlide + (distance < 0 ? 1 : -1));
		}

		track.style.transform = "translateX(0)";
		pointerStart = null;
		activePointer = null;
	};

	viewport.addEventListener("pointerup", finishDrag);
	viewport.addEventListener("pointercancel", finishDrag);

	testimonialCarousel.addEventListener("keydown", (event) => {
		if (event.key === "ArrowLeft") {
			event.preventDefault();
			showSlide(activeSlide - 1);
		} else if (event.key === "ArrowRight") {
			event.preventDefault();
			showSlide(activeSlide + 1);
		}
	});
}

const catalogGrid = document.querySelector("#catalog-grid");

if (catalogGrid) {
	const searchInput = document.querySelector("#product-search");
	const typeFilter = document.querySelector("#filter-type");
	const colorFilter = document.querySelector("#filter-color");
	const materialFilter = document.querySelector("#filter-material");
	const minimumPrice = document.querySelector("#price-min");
	const maximumPrice = document.querySelector("#price-max");
	const sortSelect = document.querySelector("#sort-products");
	const resultCount = document.querySelector("#catalog-result-count");
	const emptyMessage = document.querySelector("#catalog-empty");
	const clearFilters = document.querySelector("#clear-filters");
	const mobileFilterToggle = document.querySelector("#mobile-filter-toggle");
	const mobileFilterCount = document.querySelector("#mobile-filter-count");
	const catalogSidebar = document.querySelector("#catalog-filters");
	const previousPageButton = document.querySelector("#previous-product-page");
	const nextPageButton = document.querySelector("#next-product-page");
	const paginationStatus = document.querySelector(".pagination-status");
	const products = [...catalogGrid.querySelectorAll(".catalog-card")];
	const pageSize = 9;
	let appliedSort = "";
	let currentPage = 0;
	let pageCount = 1;

	const updateCatalog = () => {
		const query = searchInput.value.trim().toLowerCase();
		const selectedType = typeFilter.value;
		const selectedColor = colorFilter.value;
		const selectedMaterial = materialFilter.value;
		const minPrice = Number(minimumPrice.value) || 0;
		const maxPrice = Number(maximumPrice.value) || Number.POSITIVE_INFINITY;

		const visibleProducts = products.filter((product) => {
			const searchableText = `${product.dataset.name} ${product.dataset.search} ${product.dataset.color} ${product.dataset.material}`.toLowerCase();
			const colors = product.dataset.color.toLowerCase().split(/\s+/);
			const materials = product.dataset.material.toLowerCase().split(/\s+/);
			const price = Number(product.dataset.price);
	
			const matches =
				(!query || searchableText.includes(query)) &&
				(!selectedType || product.dataset.type === selectedType) &&
				(!selectedColor || colors.includes(selectedColor)) &&
				(!selectedMaterial || materials.includes(selectedMaterial)) &&
				price >= minPrice &&
				price <= maxPrice;

			return matches;
		});

		if (sortSelect.value !== appliedSort) {
			const sortedProducts = [...products];
			if (sortSelect.value === "price-low") {
				sortedProducts.sort((first, second) => Number(first.dataset.price) - Number(second.dataset.price));
			} else if (sortSelect.value === "price-high") {
				sortedProducts.sort((first, second) => Number(second.dataset.price) - Number(first.dataset.price));
			} else if (sortSelect.value === "name") {
				sortedProducts.sort((first, second) => first.dataset.name.localeCompare(second.dataset.name));
			}

			sortedProducts.forEach((product) => catalogGrid.append(product));
			appliedSort = sortSelect.value;
		}

		pageCount = Math.max(1, Math.ceil(visibleProducts.length / pageSize));
		currentPage = Math.min(currentPage, pageCount - 1);
		const pageStart = currentPage * pageSize;
		const pageProducts = visibleProducts.slice(pageStart, pageStart + pageSize);
		products.forEach((product) => {
			product.hidden = !pageProducts.includes(product);
		});

		resultCount.textContent = `${visibleProducts.length} ${visibleProducts.length === 1 ? "piece" : "pieces"}`;
		emptyMessage.hidden = visibleProducts.length > 0;
		const activeFilterCount = [
			selectedType,
			selectedColor,
			selectedMaterial,
			minPrice > 0,
			maxPrice < 25000,
		].filter(Boolean).length;
		mobileFilterCount.textContent = String(activeFilterCount);
		mobileFilterCount.hidden = activeFilterCount === 0;
		paginationStatus.textContent = `Page ${currentPage + 1} of ${pageCount}`;
		previousPageButton.setAttribute("aria-disabled", String(currentPage === 0));
		nextPageButton.setAttribute("aria-disabled", String(currentPage >= pageCount - 1));
	};

	[searchInput, minimumPrice, maximumPrice].forEach((control) => {
		control.addEventListener("input", () => {
			currentPage = 0;
			updateCatalog();
		});
	});

	[typeFilter, colorFilter, materialFilter, sortSelect].forEach((control) => {
		control.addEventListener("change", () => {
			currentPage = 0;
			updateCatalog();
		});
	});

	clearFilters.addEventListener("click", () => {
		searchInput.value = "";
		typeFilter.value = "";
		colorFilter.value = "";
		materialFilter.value = "";
		minimumPrice.value = "0";
		maximumPrice.value = "25000";
		sortSelect.value = "featured";
		currentPage = 0;
		updateCatalog();
		searchInput.focus();
	});

	mobileFilterToggle.addEventListener("click", () => {
		const isOpen = mobileFilterToggle.getAttribute("aria-expanded") !== "true";
		mobileFilterToggle.setAttribute("aria-expanded", String(isOpen));
		catalogSidebar.classList.toggle("is-open", isOpen);
	});

	previousPageButton.addEventListener("click", () => {
		currentPage = Math.max(0, currentPage - 1);
		updateCatalog();
	});

	nextPageButton.addEventListener("click", () => {
		currentPage = Math.min(pageCount - 1, currentPage + 1);
		updateCatalog();
	});

	updateCatalog();
}

const contactForm = document.querySelector("#contact-form");

if (contactForm) {
	contactForm.addEventListener("submit", (event) => {
		event.preventDefault();
		document.querySelector("#contact-form-status").textContent =
			"Thanks for your message. This preview form is not connected yet.";
		contactForm.reset();
	});
}