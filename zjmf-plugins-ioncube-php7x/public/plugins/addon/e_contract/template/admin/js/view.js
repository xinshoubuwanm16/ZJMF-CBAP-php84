(function (window, undefined) {
    var old_onload = window.onload
    window.onload = function () {
        const template = document.getElementsByClassName('contract_template')[0]
        Vue.prototype.lang = Object.assign(window.lang, window.plugin_lang);
        Vue.prototype.moment = window.moment
        const host = location.origin
        const fir = location.pathname.split('/')[1]
        const str = `${host}/${fir}/`
        new Vue({
            data() {
                return {
                    contentPage: null
                }
            },
            methods: {

            },
            created() {
                this.contentPage = JSON.parse(sessionStorage.contract_view) || null
            },
        }).$mount(template)
        typeof old_onload == 'function' && old_onload()
    };
})(window);
