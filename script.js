document.documentElement.classList.add("js");
const header = document.querySelector(".header");
function updateHeader() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 10);
}
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();
const navLinks = document.querySelectorAll(".nav-links a[href^='#']");
const sections = [...navLinks]
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

if ("IntersectionObserver" in window && sections.length) {
    const navObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                navLinks.forEach((link) => {
                    link.classList.toggle(
                        "active",
                        link.getAttribute("href") === "#" + entry.target.id
                    );
                });
            });
        },
    
        { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((section) => navObserver.observe(section));
}

const revealTargets = document.querySelectorAll(
    ".hero-content, .hero-visual, .about-feature, .about-stat, " +
    ".services-header, .service-card, .cta > *, .contact-item, .contact-form"
);

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                el.classList.add("visible");
                observer.unobserve(el);
                
                setTimeout(() => el.classList.remove("reveal", "visible"), 900);
            });
        },
        { threshold: 0.15 }
    );

    revealTargets.forEach((el, i) => {
        el.classList.add("reveal");
        
        el.style.transitionDelay = (i % 3) * 90 + "ms";
        revealObserver.observe(el);
    });
}

const contactForm = document.querySelector(".contact-form");

if (contactForm) {
    
    const status = document.createElement("p");
    status.className = "form-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    contactForm.appendChild(status);

    function showStatus(text, type) {
        status.textContent = text;
        status.className = "form-status " + type;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    contactForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const name = contactForm.querySelector('[name="name"]').value.trim();
        const email = contactForm.querySelector('[name="email"]').value.trim();
        const message = contactForm.querySelector('[name="message"]').value.trim();

        if (!name || !email || !message) {
            showStatus("Please fill in all fields.", "error");
            return;
        }
        if (!emailPattern.test(email)) {
            showStatus("Please enter a valid email address.", "error");
            return;
        }

        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalButtonHTML = submitButton ? submitButton.innerHTML : "";

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Sending...";
        }
        showStatus("", "");

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, message })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Something went wrong.");
            }

            showStatus("Thank you! Your message has been sent successfully.", "success");
            contactForm.reset();
        } catch (error) {
            showStatus(
                error.message || "Unable to send your message. Please try again.",
                "error"
            );
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonHTML;
            }
        }
    });
}