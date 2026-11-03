import React, { useState } from 'react';
import { GAS_CODE_GS } from '../gas/code';
import { Copy, Check, Download, FileCode, CheckCircle2, ChevronRight, BookOpen, ExternalLink } from 'lucide-react';

export const GasSetupModal: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(1);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GAS_CODE_GS);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([GAS_CODE_GS], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Code.gs';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const steps = [
    {
      step: 1,
      title: '1. Создание Google Таблицы',
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <p>
            Откройте <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline font-semibold">sheets.new</a> в браузере (под вашим бесплатным Google аккаунтом).
          </p>
          <p>
            Назовите таблицу, например: <strong className="text-white">МФК Каспий — База Мониторинга Wellness</strong>.
          </p>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-emerald-400">
            ✓ Банковская карта и Cloud Billing не требуются. Google Sheets полностью бесплатен.
          </div>
        </div>
      ),
    },
    {
      step: 2,
      title: '2. Открытие редактора и запуск setupSpreadsheet()',
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <p>
            В меню Google Таблицы нажмите: <strong className="text-white">Расширения → Apps Script</strong> (Extensions → Apps Script).
          </p>
          <p>
            Удалите весь стандартный текст в файле <code className="text-blue-400 font-mono">Code.gs</code> и вставьте скопированный ниже код.
          </p>
          <p>
            В выпадающем списке функций выберите <strong className="text-emerald-400 font-mono">setupSpreadsheet</strong> и нажмите кнопку <strong className="text-white font-semibold">Выполнить</strong> (Run).
          </p>
          <p className="text-[11px] text-slate-400">
            Google запросит стандартное однократное разрешение на чтение/запись вашей таблицы — подтвердите доступ ("Дополнительно" → "Перейти к проекту").
          </p>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-emerald-400">
            ✓ Скрипт мгновенно создаст 5 необходимых листов: ATHLETES, DAILY_WELLNESS, MEDICAL_REHAB, TRAINING_LOAD, REPORT_SETTINGS со всеми колонками и цветовым оформлением!
          </div>
        </div>
      ),
    },
    {
      step: 3,
      title: '3. Создание тестовых игроков (addTestAthletes)',
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <p>
            В том же редакторе Apps Script выберите в списке функцию <strong className="text-emerald-400 font-mono">addTestAthletes</strong> и нажмите <strong className="text-white font-semibold">Выполнить</strong>.
          </p>
          <p>
            Это автоматически заполнит лист <strong className="text-white font-mono">ATHLETES</strong> 18 игроками МФК «Каспий» (Адайбек #21, Али GK #02, Антон #11, Арман #05, Азиз #17 и др.) с готовыми уникальными токенами доступа.
          </p>
        </div>
      ),
    },
    {
      step: 4,
      title: '4 & 5. Развертывание Web App и настройки доступа',
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <p>В правом верхнем углу Apps Script нажмите синюю кнопку <strong className="text-white">Начать развертывание → Новое развертывание</strong> (Deploy → New deployment).</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-200">
            <li>Тип: выберите шестеренку <strong className="text-blue-400">Веб-приложение</strong> (Web app).</li>
            <li>Описание: <code className="text-slate-400">Caspiy Wellness v1</code></li>
            <li>Запуск от имени: <strong className="text-emerald-400">Меня (ваш email)</strong> — это гарантирует, что данные пишутся от вашего имени, а игрокам не нужен прямой доступ к таблице.</li>
            <li>У кого есть доступ: <strong className="text-emerald-400">Все (Anyone)</strong> — это позволяет игрокам отправлять форму без авторизации через Google аккаунт.</li>
          </ul>
          <p>Нажмите <strong className="text-white">Развернуть</strong> (Deploy).</p>
        </div>
      ),
    },
    {
      step: 6,
      title: '6. Получение URL приложения',
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <p>
            После развертывания Google выдаст URL веб-приложения вида:
          </p>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-blue-400 break-all select-all">
            https://script.google.com/macros/s/AKfycb.../exec
          </div>
          <p>
            Скопируйте этот URL и вставьте его во вкладку <strong className="text-white">Настройки</strong> нашего приложения — и все данные будут сохраняться напрямую в вашу Google Таблицу!
          </p>
        </div>
      ),
    },
    {
      step: 7,
      title: '7. Создание персональной ссылки каждого игрока',
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <p>
            Персональная постоянная ссылка формируется добавлением параметра <code className="text-blue-400 font-mono">?player=ТОКЕН</code>:
          </p>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 break-all">
            https://script.google.com/.../exec?player=token123
          </div>
          <p>
            Откройте в Dashboard раздел <strong className="text-white">Ссылки игроков</strong> — там для каждого игрока уже готова ссылка и кнопка «COPY LINK» в один клик.
          </p>
          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800 text-[11px] text-blue-300">
            💡 Игроки не видят чужих данных и токенов. Ссылка отправляется игроку в личные сообщения WhatsApp или Telegram один раз и действует весь сезон!
          </div>
        </div>
      ),
    },
    {
      step: 8,
      title: '8. Вход в Admin Dashboard',
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <p>
            Доступ к панели врача защищен паролем. Пароль по умолчанию: <strong className="text-blue-400 font-mono">caspiy2026</strong>.
          </p>
          <p>
            Вы можете изменить пароль в любой момент в настройках системы или в листе <code className="text-slate-400 font-mono">REPORT_SETTINGS</code> таблицы.
          </p>
        </div>
      ),
    },
    {
      step: 9,
      title: '9. Добавление нового игрока',
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <p>
            Чтобы добавить нового игрока, перейдите в <strong className="text-white">Ссылки игроков</strong> и нажмите кнопку <strong className="text-blue-400">+ Добавить игрока</strong>.
          </p>
          <p>
            Либо просто добавьте новую строку в лист Google Sheets <code className="text-emerald-400 font-mono">ATHLETES</code>: уникальный ID (например, A019), имя, номер, токен и active = TRUE.
          </p>
        </div>
      ),
    },
    {
      step: 10,
      title: '10 & 11. Получение PDF и CSV отчетов',
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <p>
            В разделе <strong className="text-white">Отчет тренеру</strong> нажмите:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-200">
            <li><strong className="text-blue-400">Печать / PDF</strong>: моментально формирует готовый отчет с таблицей готовности для отправки тренеру.</li>
            <li><strong className="text-emerald-400">В Google Drive</strong>: скрипт сохраняет PDF в автоматическую папку Google Drive «Caspiy_Futsal_Reports».</li>
            <li><strong className="text-amber-400">CSV (Excel)</strong>: выгружает файл в кодировке UTF-8 с BOM, корректно открывающийся в Microsoft Excel с поддержкой русского языка.</li>
          </ul>
        </div>
      ),
    },
    {
      step: 12,
      title: '12. Изменение порогов Wellness и боли',
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <p>
            Пороги статусов (GREEN $\ge$ 80%, YELLOW 70-79%, ORANGE 60-69% / боль $\ge$ 4, RED &lt; 60% / боль $\ge$ 7) можно изменить в разделе <strong className="text-white">Настройки</strong> или на листе <code className="text-slate-400 font-mono">REPORT_SETTINGS</code>.
          </p>
        </div>
      ),
    },
    {
      step: 13,
      title: '13. Резервное копирование Google Sheets',
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <p>
            В меню Google Таблицы выберите: <strong className="text-white">Файл → Создать копию</strong> (File → Make a copy) или скачайте файл в формате Excel: <strong className="text-white">Файл → Скачать → Microsoft Excel (.xlsx)</strong>.
          </p>
          <p>
            Рекомендуется скачивать резервную копию раз в месяц для архива клуба.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Code Header Bar */}
      <div className="p-5 rounded-3xl bg-[#0c1322] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
            БЕСПЛАТНЫЙ BACKEND НА GOOGLE APPS SCRIPT
          </span>
          <h2 className="text-xl font-bold text-white">Исходный код Code.gs и руководство</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Полный готовый скрипт для Google Sheets и пошаговая инструкция по развертыванию
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
              copiedCode
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
            }`}
          >
            {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedCode ? 'Код скопирован в буфер!' : 'Скопировать Code.gs'}</span>
          </button>

          <button
            onClick={handleDownloadFile}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Скачать файл Code.gs</span>
          </button>
        </div>
      </div>

      {/* Grid: 13-Step Guide & Interactive Code View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 13 Steps Accordion / Selector */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Пошаговая инструкция развертывания
            </span>
            <span className="text-xs text-blue-400 font-mono">13 шагов</span>
          </div>

          <div className="space-y-2">
            {steps.map((s) => {
              const isOpen = activeStep === s.step;
              return (
                <div
                  key={s.step}
                  className={`rounded-2xl border transition-all ${
                    isOpen
                      ? 'bg-[#0c1322] border-blue-500/40 shadow-lg'
                      : 'bg-[#090f1b] border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <button
                    onClick={() => setActiveStep(isOpen ? 0 : s.step)}
                    className="w-full p-3.5 flex items-center justify-between text-left"
                  >
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-mono text-[11px]">
                        {s.step}
                      </span>
                      {s.title}
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 text-slate-500 transition-transform ${
                        isOpen ? 'rotate-90 text-blue-400' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-800/60">
                      {s.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Code Preview Container */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Исходный код Google Apps Script (Code.gs)
            </span>
            <span className="text-xs text-emerald-400 font-mono">Готов к вставке</span>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#090f1b] overflow-hidden flex flex-col h-[650px]">
            <div className="px-4 py-3 bg-[#070b14] border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-blue-400 font-semibold flex items-center gap-1.5">
                <FileCode className="w-4 h-4" /> Code.gs (Apps Script)
              </span>
              <button
                onClick={handleCopyCode}
                className="text-slate-300 hover:text-white flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" /> Копировать
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 font-mono text-[11px] text-slate-300 leading-relaxed bg-[#070b14]/50 select-all">
              <pre>{GAS_CODE_GS}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
