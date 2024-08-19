import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import * as hbs from 'hbs';
import { resolve, join } from 'path';
// import * as sassMiddlewear from 'node-sass-middleware-5';
import *  as session from 'express-session';
import * as moment from 'moment';
import { NextFunction, Request, Response } from 'express';
import axios from 'axios';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);


  app.useStaticAssets(join(__dirname, '..', '/public'));
  app.setBaseViewsDir(join(__dirname, '..', '/views'));
  hbs.registerPartials(join(__dirname, '..', '/views/partials'));

  app.setViewEngine('hbs');

  hbs.registerHelper('section', function (name, options) {
    if (!this._sections) this._sections = [];
    this._sections.push(options.fn(this));
    return null;
  });

  hbs.registerHelper('metasection', function (name, options) {
    if (!this._metasections) this._metasections = [];
    this._metasections.push(options.fn(this));
    return null;
  });

  hbs.registerHelper('script_section', function (name, options) {
    if (!this.scriptsection) this.scriptsection = [];
    this.scriptsection.push(options.fn(this));
    return null;
  });

  hbs.registerHelper('cleanhtml', function (html) {
    return html
      .replace(/(style=")([a-zA-Z0-9:;\.\s\(\)\-\,]*)(")/gmi, '')
      .replace(/(style=')([a-zA-Z0-9:;\.\s\(\)\-\,]*)(')/gmi, '')
      .replace(/<p><\/p>/gmi, '')
      .replace(/<p class="MsoNormal"><br><\/p>/gmi, '')
      .replace(/<p class="MsoNormal"><span><br><\/span><\/p>/gmi, '')
      .replace(/class="MsoNormal"/gmi, '')
      .replace(/(<font [a-zA-Z0-9="]+)>/gmi, '').replace(/<\/font>/gmi, '')
      .replace(/<p><br><\/p>/gmi, '').replace(/<span [a-zA-z="'-]+>/gmi, '')
      .replace(/<\/span>/gmi, '').replace(/<p><br><\/p>/gmi, '')
      .replace(/<br>/gmi, '')
      .replace(/<br\/>/gmi, '');
  })

  hbs.registerHelper('removeAllHtml', (str) => {
    if (str) {
      // Remove style attributes
      str = str.replace(/<style[^>]+>[\s\S]*<\/style>/gmi, '');

      // Remove JavaScript tags
      str = str.replace(/<script[^>]+>[\s\S]*<\/script>/gmi, '');

      str = str.replace('/<link[^\/>]/gmi', '');

      str = str.replace(/<[^>]+>/gmi, '');

      // Return the cleaned string
      return str;
    }

    return '';
  });

  const ignoreWords = ['to', 'for', 'and', 'in'];
  const justIgnore = ['ai']

  hbs.registerHelper('normailzeString', (str) => {
    let words = str.split(' ').filter(x => x.trim() !== '');
    let changed = [];
    words.forEach(w => {
      if (justIgnore.indexOf(w.toLowerCase().trim()) === -1) {
        if (ignoreWords.indexOf(w.toLowerCase().trim()) == -1)
          changed.push((w[0] ? w[0].toUpperCase() : w[0]) + w.substr(1, w.length - 1).toLowerCase());
        else
          changed.push(w.toLowerCase().trim());
      } else {
        changed.push(w.trim());
      }
    });
    return changed.join(' ').trim();
  });

  hbs.registerHelper('for', function (from, to, incr, block) {
    var accum = '';
    let data = {};

    for (var i = from; i < to + 1; i += incr) {
      data['index'] = i;
      accum += block.fn(i, { data: data });
    }
    return accum;
  });

  hbs.registerHelper('iter', function (context, limit, options) {
    var fn = options.fn, inverse = options.inverse;
    var ret = "";

    if (context && context > 0) {
      for (var i = 0, j = (context > limit ? limit : context); i < j; i++) {
        ret = ret + fn({ i: i, iPlus1: i + 1 });
      }
    } else {
      ret = inverse(this);
    }
    return ret;
  });

  hbs.registerHelper('if_eq', function (a, b, opts) {
    if (a === b) {
      return opts.fn(this);
    } else {
      return opts.inverse(this);
    }
  });


  hbs.registerHelper('split_each', function (a, b, opts) {
    let spt = a.split(b);
    let fk = '';
    spt.forEach(element => {
      fk += opts.fn(element);
    });
    return fk;
  });

  hbs.registerHelper('join', function (arr, joinWith) {
    return arr.join(joinWith);
  })

  hbs.registerHelper('getVideoID', function (str) {
    let urlSeg = str.split('/').filter(x => x.trim() !== '');
    return urlSeg[urlSeg.length - 1];
  });

  hbs.registerHelper('if_not_eq', function (a, b, opts) {
    if (a !== b) {
      return opts.fn(this);
    } else {
      return opts.inverse(this);
    }
  });

  hbs.registerHelper('if_contains', function (str, search, opts) {
    try {
      if (str.indexOf(search) > -1) {
        return opts.fn(this);
      } else {
        return opts.inverse(this);
      }
    } catch (ex) {
      console.log('search', search);
    }
  })

  hbs.registerHelper('if_not_contains', function (str, search, opts) {
    try {
      if (str.indexOf(search) == -1) {
        return opts.fn(this);
      } else {
        return opts.inverse(this);
      }
    } catch (ex) {

      console.log('search', search);

      //console.log(opts);
      //console.log(ex)
    }
  })

  hbs.registerHelper('substring', function (str, from, to) {
    return str.replace(/(<([^>]+)>)/gi, "").substring(from, to);
  });

  hbs.registerHelper('comma', function (arr, value) {
    return arr.map(a => {
      return a[value];
    }).join(', ');
  })

  hbs.registerHelper('split', function (str, sep) {
    return str.split(sep);
  });

  hbs.registerHelper('json', function (content) {
    return JSON.stringify(content);
  });

  let localIndex = 0;
  hbs.registerHelper('localindex', function () {
    return localIndex++;
  });

  hbs.registerHelper('reset_localindex', function () {
    localIndex = 0;
  });

  hbs.registerHelper('formatdate', function (dt, format) {
    return moment(dt, true).format(format);
  });

  hbs.registerHelper('getDate', function (format, add, fromDateString) {
    let m = moment();
    return fromDateString ? `${m.add(add, 'year').year()}-${fromDateString}` : m.add(add, 'year').format(format);
  })

  const prepositions = ['a', 'the', 'an', 'and', 'in', 'its', 'across', 'of'];
  const donotTouch = ['us', 'usa', 'apac', 'na', 'eu']

  hbs.registerHelper('camelCase', function (str) {
    return str.replace(/\w+/gmi, (w) => prepositions.indexOf(w.toLowerCase()) == -1 && donotTouch.indexOf(w.toLowerCase()) == -1 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : donotTouch.indexOf(w.toLowerCase()) == -1 ? w.toLowerCase() : w).replace(/vmr/gmi, 'Vantage Market Research');
  });

  hbs.registerHelper('globalcanonical', function () {

  });

  hbs.registerHelper('getUrl', function (str, upperCase = false) {
    if (str) {
      str = str.split(' ').map(x => ignoreWords.indexOf(x.toLowerCase()) > -1 ? x.toLowerCase() : x).join(' ');
      let res = str ? str.trim().replace(/[\s\/]+/gmi, '-').replace(/&/gmi, 'and').replace(/[^a-zA-Z0-9\-]/gmi, '') : '';
      res = res.replace(/&/gmi, 'and');
      return upperCase ? res.toUpperCase() : res;
    }
    return '';
  });

  hbs.registerHelper('replace', function (str, oldStr, newStr) {
    return str.replace(oldStr, newStr);
  });

  hbs.registerHelper('math', function (a, op, b) {
    let result = 0;
    switch (op) {
      case '+':
        result = parseInt(a) + parseInt(b);
        break;
      case '-':
        result = parseInt(a) - parseInt(b);
        break;
      case '/':
        result = parseInt(a) / parseInt(b);
        break;
      case '*':
        result = parseInt(a) * parseInt(b);
        break;
    }
    return result;
  });

  app.enableCors({
    origin: ['https://www.vantagemarketresearch.com', 'https://vpoint.vantagemarketresearch.com', 'https://p010824-nestjs.7c2g7o.easypanel.host' ]
  });

  app.use(session({
    secret: '1@m7h380s5',
    resave: false,
    saveUninitialized: false
  }));

  var localUrl = '';

  app.set('view options', { layout: 'layout' });

  app.use(function (req: Request, res: Response, next: NextFunction) {
    console.log(req.url);
    if ((!localUrl || localUrl !== req.url) && req.url.indexOf('/assets/') == -1
      && req.headers["x-requested-with"] !== 'XMLHttpRequest' && req.url.indexOf('.') == -1) {
      localUrl = req.url;

      let host = `https://${req.hostname}${(req.hostname == 'localhost' ? 3000 : '')}`;

      app.setLocal('CURRENT_URL', host + req.url);

    }



    // let userAgent = req.headers['user-agent'];

    // const toMatch = [
    //   /Android/i,
    //   /webOS/i,
    //   /iPhone/i,
    //   /iPad/i,
    //   /iPod/i,
    //   /BlackBerry/i,
    //   /Windows Phone/i
    // ];

    // let isMobileUser = toMatch.some((toMatchItem) => {
    //   return userAgent.match(toMatchItem);
    // });

    // if (isMobileUser && req.url.indexOf('/industry-report/') > -1) {
    //   app.set('view options', { layout: '' });
    // }
    // else
    //   app.set('view options', { layout: 'layout' });

    next();
  });

  app.use(function (req: Request, res: Response, next: NextFunction) {
    let host = `https://${req.hostname}${(req.hostname == 'localhost' ? 3000 : '')}`;
    app.setLocal('host', host);
    app.setLocal('hostwithoutwww', req.hostname.replace('www.', ''));
    next();
  });

  app.setLocal('API_URL_HBS', process.env.API_URL);
  app.setLocal('previousYear', new Date().getFullYear() - 1);
  app.setLocal('currentYear', new Date().getFullYear())


  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
