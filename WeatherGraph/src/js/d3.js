(function () {
    function d3_class(ctor, properties) {
        try {
            for (var key in properties) {
                Object.defineProperty(ctor.prototype, key, {
                    value: properties[key],
                    enumerable: false
                });
            }
        } catch (e) {
            ctor.prototype = properties;
        }
    }



    function d3_arraySlice(pseudoarray) {
        return Array.prototype.slice.call(pseudoarray);
    }


    function d3_Map() {}

    function d3_identity(d) {
        return d;
    }

    function d3_true() {
        return true;
    }

    function d3_functor(v) {
        return typeof v === "function" ? v : function () {
            return v;
        };
    }

    function d3_uninterpolateNumber(a, b) {
        b = b - (a = +a) ? 1 / (b - a) : 0;
        return function (x) {
            return (x - a) * b;
        };
    }


    function d3_selection(groups) {
        d3_arraySubclass(groups, d3_selectionPrototype);
        return groups;
    }

    function d3_selection_selector(selector) {
        return function () {
            return d3_select(selector, this);
        };
    }


    function d3_selection_attr(name, value) {
        function attrNull() {
            this.removeAttribute(name);
        }

        function attrNullNS() {
            this.removeAttributeNS(name.space, name.local);
        }

        function attrConstant() {
            this.setAttribute(name, value);
        }

        function attrConstantNS() {
            this.setAttributeNS(name.space, name.local, value);
        }

        function attrFunction() {
            var x = value.apply(this, arguments);
            if (x == null) this.removeAttribute(name);
            else this.setAttribute(name, x);
        }

        function attrFunctionNS() {
            var x = value.apply(this, arguments);
            if (x == null) this.removeAttributeNS(name.space, name.local);
            else this.setAttributeNS(name.space, name.local, x);
        }
        name = d3.ns.qualify(name);
        return value == null ? name.local ? attrNullNS : attrNull : typeof value === "function" ? name.local ? attrFunctionNS : attrFunction : name.local ? attrConstantNS : attrConstant;
    }

    function d3_selection_each(groups, callback) {
        for (var j = 0, m = groups.length; j < m; j++) {
            for (var group = groups[j], i = 0, n = group.length, node; i < n; i++) {
                if (node = group[i]) callback(node, i, j);
            }
        }
        return groups;
    }

    function d3_scale_linear(domain, range, interpolate, clamp) {
        function rescale() {
            var linear = Math.min(domain.length, range.length) > 2 ? d3_scale_polylinear : d3_scale_bilinear,
                uninterpolate = clamp ? d3_uninterpolateClamp : d3_uninterpolateNumber;
            output = linear(domain, range, uninterpolate, interpolate);
            input = linear(range, domain, uninterpolate, d3.interpolate);
            return scale;
        }

        function scale(x) {
            return output(x);
        }
        var output, input;
        scale.invert = function (y) {
            return input(y);
        };
        scale.domain = function (x) {
            if (!arguments.length) return domain;
            domain = x.map(Number);
            return rescale();
        };
        scale.range = function (x) {
            if (!arguments.length) return range;
            range = x;
            return rescale();
        };
        scale.rangeRound = function (x) {
            return scale.range(x).interpolate(d3.interpolateRound);
        };
        scale.clamp = function (x) {
            if (!arguments.length) return clamp;
            clamp = x;
            return rescale();
        };
        scale.interpolate = function (x) {
            if (!arguments.length) return interpolate;
            interpolate = x;
            return rescale();
        };
        scale.ticks = function (m) {
            return d3_scale_linearTicks(domain, m);
        };
        scale.tickFormat = function (m) {
            return d3_scale_linearTickFormat(domain, m);
        };
        scale.nice = function () {
            d3_scale_nice(domain, d3_scale_linearNice);
            return rescale();
        };
        scale.copy = function () {
            return d3_scale_linear(domain, range, interpolate, clamp);
        };
        return rescale();
    }

    function d3_scale_linearRebind(scale, linear) {
        return d3.rebind(scale, linear, "range", "rangeRound", "interpolate", "clamp");
    }

    function d3_scale_linearNice(dx) {
        dx = Math.pow(10, Math.round(Math.log(dx) / Math.LN10) - 1);
        return dx && {
            floor: function (x) {
                return Math.floor(x / dx) * dx;
            },
            ceil: function (x) {
                return Math.ceil(x / dx) * dx;
            }
        };
    }

    function d3_scale_linearTickRange(domain, m) {
        var extent = d3_scaleExtent(domain),
            span = extent[1] - extent[0],
            step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10)),
            err = m / span * step;
        if (err <= .15) step *= 10;
        else if (err <= .35) step *= 5;
        else if (err <= .75) step *= 2;
        extent[0] = Math.ceil(extent[0] / step) * step;
        extent[1] = Math.floor(extent[1] / step) * step + step * .5;
        extent[2] = step;
        return extent;
    }

    function d3_scale_linearTicks(domain, m) {
        return d3.range.apply(d3, d3_scale_linearTickRange(domain, m));
    }

    function d3_scale_linearTickFormat(domain, m) {
        return d3.format(",." + Math.max(0, -Math.floor(Math.log(d3_scale_linearTickRange(domain, m)[2]) / Math.LN10 + .01)) + "f");
    }

    function d3_scale_bilinear(domain, range, uninterpolate, interpolate) {
        var u = uninterpolate(domain[0], domain[1]),
            i = interpolate(range[0], range[1]);
        return function (x) {
            return i(u(x));
        };
    }

    function d3_svg_line(projection) {
        function line(data) {
            function segment() {
                segments.push("M", interpolate(projection(points), tension));
            }
            var segments = [],
                points = [],
                i = -1,
                n = data.length,
                d, fx = d3_functor(x),
                fy = d3_functor(y);
            while (++i < n) {
                if (defined.call(this, d = data[i], i)) {
                    points.push([+fx.call(this, d, i), +fy.call(this, d, i)]);
                } else if (points.length) {
                    segment();
                    points = [];
                }
            }
            if (points.length) segment();
            return segments.length ? segments.join("") : null;
        }
        var x = d3_svg_lineX,
            y = d3_svg_lineY,
            defined = d3_true,
            interpolate = d3_svg_lineLinear,
            interpolateKey = interpolate.key,
            tension = .7;
        line.x = function (_) {
            if (!arguments.length) return x;
            x = _;
            return line;
        };
        line.y = function (_) {
            if (!arguments.length) return y;
            y = _;
            return line;
        };
        return line;
    }

    function d3_svg_lineX(d) {
        return d[0];
    }

    function d3_svg_lineY(d) {
        return d[1];
    }

    function d3_svg_lineLinear(points) {
        return points.join("L");
    }

    d3 = {
        version: "2.10.3"
    };
    var d3_array = d3_arraySlice;
    try {
        d3_array(document.documentElement.childNodes)[0].nodeType;
    } catch (e) {
        d3_array = d3_arrayCopy;
    }
    var d3_arraySubclass = [].__proto__ ? function (array, prototype) {
        array.__proto__ = prototype;
    } : function (array, prototype) {
        for (var property in prototype) array[property] = prototype[property];
    };

    var d3_nsPrefix = {
        svg: "http://www.w3.org/2000/svg",
        xhtml: "http://www.w3.org/1999/xhtml",
        xlink: "http://www.w3.org/1999/xlink",
        xml: "http://www.w3.org/XML/1998/namespace",
        xmlns: "http://www.w3.org/2000/xmlns/"
    };

    d3.ns = {
        prefix: d3_nsPrefix,
        qualify: function (name) {
            var i = name.indexOf(":"),
                prefix = name;
            if (i >= 0) {
                prefix = name.substring(0, i);
                name = name.substring(i + 1);
            }
            return d3_nsPrefix.hasOwnProperty(prefix) ? {
                space: d3_nsPrefix[prefix],
                local: name
            } : name;
        }
    };

    d3.interpolate = function (a, b) {
        var i = d3.interpolators.length,
            f;
        while (--i >= 0 && !(f = d3.interpolators[i](a, b)));
        return f;
    };
    d3.interpolateNumber = function (a, b) {
        b -= a;
        return function (t) {
            return a + b * t;
        };
    };

    var d3_interpolate_number = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;

    d3.interpolators = [d3.interpolateObject, function (a, b) {
        return b instanceof Array && d3.interpolateArray(a, b);
    }, function (a, b) {
        return (typeof a === "string" || typeof b === "string") && d3.interpolateString(a + "", b + "");
    }, function (a, b) {
        return (typeof b === "string" ? d3_rgb_names.has(b) || /^(#|rgb\(|hsl\()/.test(b) : b instanceof d3_Color) && d3.interpolateRgb(a, b);
    }, function (a, b) {
        return !isNaN(a = +a) && !isNaN(b = +b) && d3.interpolateNumber(a, b);
    }];


    var d3_select = function (s, n) {
        return n.querySelector(s);
    };

    var d3_selectionPrototype = [];
    d3.selection = function () {
        return d3_selectionRoot;
    };
    d3.selection.prototype = d3_selectionPrototype;
    d3_selectionPrototype.select = function (selector) {
        var subgroups = [],
            subgroup, subnode, group, node;
        if (typeof selector !== "function") selector = d3_selection_selector(selector);
        for (var j = -1, m = this.length; ++j < m;) {
            subgroups.push(subgroup = []);
            subgroup.parentNode = (group = this[j]).parentNode;
            for (var i = -1, n = group.length; ++i < n;) {
                if (node = group[i]) {
                    subgroup.push(subnode = selector.call(node, node.__data__, i));
                    if (subnode && "__data__" in node) subnode.__data__ = node.__data__;
                } else {
                    subgroup.push(null);
                }
            }
        }
        return d3_selection(subgroups);
    };

    d3_selectionPrototype.attr = function (name, value) {
        if (arguments.length < 2) {
            if (typeof name === "string") {
                var node = this.node();
                name = d3.ns.qualify(name);
                return name.local ? node.getAttributeNS(name.space, name.local) : node.getAttribute(name);
            }
            for (value in name) this.each(d3_selection_attr(value, name[value]));
            return this;
        }
        return this.each(d3_selection_attr(name, value));
    };

    d3_selectionPrototype.append = function (name) {
        function append() {
            return this.appendChild(document.createElementNS(this.namespaceURI, name));
        }

        function appendNS() {
            return this.appendChild(document.createElementNS(name.space, name.local));
        }
        name = d3.ns.qualify(name);
        return this.select(name.local ? appendNS : append);
    };

    d3_selectionPrototype.each = function (callback) {
        return d3_selection_each(this, function (node, i, j) {
            callback.call(node, node.__data__, i, j);
        });
    };

    var d3_selectionRoot = d3_selection([
        [document]
    ]);
    //d3_selectionRoot[0].parentNode = d3_selectRoot;
    d3.select = function (selector) {
        return typeof selector === "string" ? d3_selectionRoot.select(selector) : d3_selection([
            [selector]
        ]);
    };

    d3.scale = {};
    d3.scale.linear = function () {
        return d3_scale_linear([0, 1], [0, 1], d3.interpolate, false);
    };

    d3.svg = {};
    d3.svg.line = function () {
        return d3_svg_line(d3_identity);
    };




})();