/*!
 * WebCodeCamJS 2.1.0 javascript Bar code and QR code decoder 
 * Author: Tóth András
 * Web: http://atandrastoth.co.uk
 * email: atandrastoth@gmail.com
 * Licensed under the MIT license
 */
(function(undefined) {
    "use strict";
    var Ajax = function() {
        var xr = function() {
            if (typeof XMLHttpRequest !== "undefined") {
                return new XMLHttpRequest();
            }
            var versions = ["MSXML2.XmlHttp.5.0", "MSXML2.XmlHttp.4.0", "MSXML2.XmlHttp.3.0", "MSXML2.XmlHttp.2.0", "Microsoft.XmlHttp"];
            var xhr;
            for (var i = 0; i < versions.length; i++) {
                try {
                    xhr = new ActiveXObject(versions[i]);
                    break;
                } catch (e) {}
            }
            return xhr;
        };
        var send = function(url, callBack, method, data, sync, callBackProgress) {
            var x = xr();
            x.open(method, url, sync);
            x.onreadystatechange = function() {
                if (x.readyState == 4 && x.status == 200) {
                    this.data = data;
                    callBack(this);
                }
            };
            x.onprogress = function(e) {
                if (e.lengthComputable && typeof callBackProgress == "function") {
                    callBackProgress(e);
                }
            };
            if (method == "POST") {
                x.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            }
            x.send(data);
        };
        var run = function(type, url, data, callBack, sync, callBackProgress) {
            var query = [];
            for (var key in data) {
                if (typeof data[key] === "object" && type == "POST") data[key] = JSON.stringify(data[key]);
                query.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
            }
            if (type == "POST") {
                send(url, callBack, "POST", query.join("&"), sync, callBackProgress);
            } else {
                send(url + "?" + query.join("&"), callBack, "GET", null, sync, callBackProgress);
            }
        };
        return {
            GET: function(url, data, callBack, sync, callBackProgress) {
                run("GET", url, data, callBack, sync, callBackProgress);
            },
            POST: function(url, data, callBack, sync, callBackProgress) {
                run("POST", url, data, callBack, sync, callBackProgress);
            }
        };
    };

    function Q(el) {
        if (typeof el === "string") {
            var els = document.querySelectorAll(el);
            return typeof els === "undefined" ? undefined : els.length > 1 ? els : els[0];
        }
        return el;
    }
    var txt = "innerText" in HTMLElement.prototype ? "innerText" : "textContent";
    var scannerLaser = Q(".scanner-laser"),
        scannedImg = Q("#scanned-img"),
        scannedQR = Q("#scanned-QR"),
        grabImg = Q("#grab-img")
    var args = {
        autoBrightnessValue: 100,
        resultFunction: function(res) {
            new Ajax().POST('com.php', {
                params: {
                    order: 'save_data',
                    img: res.imgData,
                    txt: res.format + ": " + res.code,
                    app: 'WebCodeCamJS'
                }
            }, function() {}, true);
            [].forEach.call(scannerLaser, function(el) {
                fadeOut(el, 0.5);
                setTimeout(function() {
                    fadeIn(el, 0.5);
                }, 300);
            });
            scannedImg.src = res.imgData;
            scannedQR[txt] = res.format + ": " + res.code;
        },
        cameraSuccess: function() {
            grabImg.classList.remove("disabled");
        }
    };
    var decoder = new WebCodeCamJS("#webcodecam-canvas").buildSelectMenu("#camera-select", "environment|back").init(args);
    decoder.play();

    function fadeOut(el, v) {
        el.style.opacity = 1;
        (function fade() {
            if ((el.style.opacity -= 0.1) < v) {
                el.style.display = "none";
                el.classList.add("is-hidden");
            } else {
                requestAnimationFrame(fade);
            }
        })();
    }

    function fadeIn(el, v, display) {
        if (el.classList.contains("is-hidden")) {
            el.classList.remove("is-hidden");
        }
        el.style.opacity = 0;
        el.style.display = display || "block";
        (function fade() {
            var val = parseFloat(el.style.opacity);
            if (!((val += 0.1) > v)) {
                el.style.opacity = val;
                requestAnimationFrame(fade);
            }
        })();
    }
    document.querySelector("#camera-select").addEventListener("change", function() {
        if (decoder.isInitialized()) {
            decoder.stop().play();
        }
    });
}).call(window.Page = window.Page || {});