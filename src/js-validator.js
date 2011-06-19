/**
 * 
 * js-validator
 * 
 * This script supports the validation procedure.
 * The script have a several rules.
 * If you add a rule to the engine, you can add the rules by callback function. 
 * 
 * @version 0.1
 * @author Yoshinobu Wakamatsu / Volare Inc.
 * @address http://www.yshnb.jp
 * 
 * 
 */
/*

var
int_val = 1, // Integer
str_val = 'hogehoge', // String
date_val = '2011-05-01 12:13:16'; // DateTime
ip_str = '192.168.11.1', // ip address
email = 'hogehoge@example.com', // email

-----Usage

validator = validationEngine(); // create validator object

validator.exec(int_val, ['notempty']); // true
validator.exec(int_val, ['numeric']); // true
validator.exec(int_val, ['numeric', ['between', 3, 5]]); // false, because int_val equals 1 < 3
validator.exec(str_val, ['notempty', 'numeric']); // false, because the type of str_val is not integer.
validator.exec(str_val, [['strlength', 6]]); // false, because str_val is longer than 6 character.
validator.exec(date_val, ['date_val']); // true
validator.exec(ip_str, ['ip_addr']); // true
validator.exec(email, ['email']); // true

 */
validationEngine = (function() {
	// closure scope
	
	// private static method
	var _default_funcs = {};
	
	_default_funcs.notempty = function(variable) {
		if (typeof variable === 'undefined') {
			return false;
		} else {
			if (String(variable) === '') {
				return false;
			} else {
				return true;
			}
		}
	};// _default_funcs.notempty()
		
	_default_funcs.numeric = function(variable) {
		if (typeof variable === 'undefined') {
			return false;
		} else {
			if (String(variable).search(/^[0-9\.]+$/) === 0) {
				return true;
			} else {
				return false;
			}
		}
	};// _default_funcs.numeric()
	
	_default_funcs.int_numeric = function(variable) {
		if (typeof variable === 'undefined') {
			return false;
		} else {
			if (String(variable).search(/^[0-9]+$/) === 0) {
				return true;
			} else {
				return false;
			}
		}
	};// _default_funcs.int_numeric()
	
	_default_funcs.alphabetic = function(variable) {
		if (typeof variable === 'undefined') {
			return false;
		} else {
			if (String(variable).search(/^[a-zA-Z0-9]+$/) === 0) {
				return true;
			} else {
				return false;
			}
		}
	};// _default_funcs.alphabetic()
	
	_default_funcs.between = function(variable, condition) {
		var num,
			lower_limit = parseFloat(condition.shift()),
			upper_limit = parseFloat(condition.shift());
		if (typeof variable === 'undefined') {
			return false;
		} else {
			num = parseFloat(variable);
			if (num < lower_limit || num > upper_limit) {
				return false;
			} else {
				return true;
			}
		}
	};// _default_funcs.between()
	
	_default_funcs.strlength = function(variable, condition) {
		var limit = condition.shift();
		if (typeof variable === 'undefined') {
			return false;
		} else {
			if (String(variable).length > limit) {
				return false;
			} else {
				return true;
			}
		}
	},// _default_funcs.length()
	
	_default_funcs.datetime = function(variable) {
		var index, orders,
			criteria = [12, 31, 24, 60, 60];
		if (typeof variable === 'undefined') {
			return false;
		} else {
			orders = String(variable).match(/^[0-9]{4}\-([0-9]{2})\-([0-9]{2})\s([0-9]{2})\:([0-9]{2})\:([0-9]{2})$/);
			if (orders !== null) {
				for (index = 1; index <= 4; index++) {
					if (parseInt(orders[index]) > criteria[index]) {
						return false;
					}
				}
				return true;
			}
			return false;
		}
	},// _default_funcs.datetime()
	
	_default_funcs.ip_addr = function(variable) {
		var orders, index;
		if (typeof variable === 'undefined') {
			return false;
		} else {
			orders = String(variable).match(/^([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/);
			if (orders !== null) {
				for (index = 1; index <= 4; index++) {
					if (parseInt(orders[index]) < 0 && parseInt(orders[index]) > 255) {
						return false;
					}
				}
				return true;
			} else {
				return false;
			}
		}
	},// _default_funcs.ip_addr()
	
	_default_funcs.email = function(variable) {
		if (typeof variable === 'undefined') {
			return false;
		} else {
			if (String(variable).search(/^(?:(?:(?:(?:[a-zA-Z0-9_!#\$\%&'*+/=?\^`{}~|\-]+)(?:\.(?:[a-zA-Z0-9_!#\$\%&'*+/=?\^`{}~|\-]+))*)|(?:"(?:\\[^\r\n]|[^\\"])*")))\@(?:(?:(?:(?:[a-zA-Z0-9_!#\$\%&'*+/=?\^`{}~|\-]+)(?:\.(?:[a-zA-Z0-9_!#\$\%&'*+/=?\^`{}~|\-]+))*)|(?:\[(?:\\\S|[\x21-\x5a\x5e-\x7e])*\])))$/) === 0) {
				return true;
			} else {
				return false;
			}
		}
	};// _default_funcs.email()
	
	return function() {
		// private member
		var
		// error_message
		_error_message = {
			'notempty' : 'you must input something.',
			'numeric' : 'value must be numeric.',
			'int_numeric' : 'value must be integer.',
			'alphabetic' : 'value must be alpabetic.',
			'between' : 'value must be in the paticular range.',
			'strlength' : 'the length of string is too long.',
			'ip_addr' : 'value is not ip address.',
			'datetime' : 'value is not datetime.',
			'email' : 'value is not email address.',
		},// error_message
		
		_funcs = {
			'notempty' : _default_funcs.notempty,
			'numeric' : _default_funcs.numeric,
			'int_numeric' : _default_funcs.int_numeric,
			'alphabetic' : _default_funcs.alphabetic,
			'between' : _default_funcs.between,
			'strlength' : _default_funcs.strlength,
			'ip_addr' : _default_funcs.ip_addr,
			'datetime' : _default_funcs.datetime,
			'email' : _default_funcs.email,
		},// _funcs
		
		_error = function(rule, option) {
			console.log(_error_message[rule]);
		},// error()
		
		exec = function(variable, rules, option) {
			var all_result = true,
				result,
				rule,
				i;
			i = rules.length;
			for (i in rules) {
				if (typeof rules[i] === 'string') {
					rule = rules[i];
					result = _funcs[rule](variable);
				} else if (typeof rules[i] === 'object') {
					rule = rules[i].shift();
					result = _funcs[rule](variable, rules[i]);
				}
				if (result === false) {
					_error(rule, option);
				}
				all_result = all_result && result;
			}
			return all_result;
		},// exec()
		
		setRules = function(rule, func) {
			_funcs[rule] = func;
		},// setRules()
		
		setError = function(func) {
			_error = func;
		};// setError()
		
		// accessible method
		return {
			exec : exec,
			setError : setError,
			setRules : setRules,
		};
		
	};// return function()
}());// validationEngine
