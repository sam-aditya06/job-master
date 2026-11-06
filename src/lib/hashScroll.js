export default function scrollToHash() {
    const hash = decodeURIComponent(
        window.location.hash.slice(1)
    );

    if (!hash) return;

    const element = document.getElementById(hash);

    element?.scrollIntoView({
        behavior: "smooth",
        block: "start",
    });
};