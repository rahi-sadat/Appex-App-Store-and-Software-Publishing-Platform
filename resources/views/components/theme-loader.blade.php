<script>
    (function () {
        try {
            const savedTheme = window.localStorage.getItem("appex-theme");
            document.documentElement.dataset.theme = savedTheme === "dark" ? "dark" : "light";
        } catch (error) {
            document.documentElement.dataset.theme = "light";
        }
    })();
</script>
