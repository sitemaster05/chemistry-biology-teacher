-- ============================================================
-- Настройка Supabase для формы обратной связи
-- Сайт-визитка учителя химии и биологии
-- ============================================================
--
-- ГДЕ ВЫПОЛНИТЬ:
--   1. Откройте https://supabase.com/dashboard
--   2. Выберите ваш проект (kqetdirftjklrpmttzev)
--   3. Слева откройте «SQL Editor» (Редактор SQL)
--   4. Вставьте ВЕСЬ текст ниже и нажмите «Run» (Выполнить)
--
-- ЧТО ДЕЛАЕТ:
--   * Создаёт таблицу contact_messages для сообщений с формы сайта
--   * Настраивает права:
--       - посетители сайта могут ОТПРАВЛЯТЬ сообщения (INSERT),
--         но не могут их читать, менять или удалять;
--       - админ-панель (вход по email/паролю) может читать,
--       отмечать прочитанными и удалять сообщения.
--
-- Выполнять скрипт нужно ТОЛЬКО ОДИН РАЗ.
-- Повторный запуск безопасен: скрипт проверяет существование объектов.
-- ============================================================

-- 1. Таблица сообщений
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2. Комментарии для удобства в дашборде Supabase
comment on table public.contact_messages is 'Сообщения из формы обратной связи на сайте';
comment on column public.contact_messages.name is 'Имя отправителя';
comment on column public.contact_messages.contact is 'Телефон / email / Telegram для ответа';
comment on column public.contact_messages.message is 'Текст сообщения';
comment on column public.contact_messages.is_read is 'Прочитано ли сообщение в админ-панели';

-- 3. Включаем защиту строк (RLS)
alter table public.contact_messages enable row level security;

-- 4. Политики доступа
-- 4.1. Любой посетитель сайта может отправить сообщение
drop policy if exists "contact_messages_insert_public" on public.contact_messages;
create policy "contact_messages_insert_public"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

-- 4.2. Читать сообщения может только админ (авторизованный пользователь)
drop policy if exists "contact_messages_read_admin" on public.contact_messages;
create policy "contact_messages_read_admin"
  on public.contact_messages
  for select
  to authenticated
  using (true);

-- 4.3. Отмечать прочитанным может только админ
drop policy if exists "contact_messages_update_admin" on public.contact_messages;
create policy "contact_messages_update_admin"
  on public.contact_messages
  for update
  to authenticated
  using (true)
  with check (true);

-- 4.4. Удалять сообщения может только админ
drop policy if exists "contact_messages_delete_admin" on public.contact_messages;
create policy "contact_messages_delete_admin"
  on public.contact_messages
  for delete
  to authenticated
  using (true);

-- 5. Права доступа для ролей Supabase
--    (anon — посетители сайта, authenticated — админ после входа)
grant insert on public.contact_messages to anon;
grant select, insert, update, delete on public.contact_messages to authenticated;

-- ============================================================
-- ГОТОВО!
-- После выполнения:
--   * на сайте появится рабочая форма «Написать сообщение»
--     (раздел «Контакты»);
--   * в админ-панели появится раздел «Сообщения»
--     со счётчиком непрочитанных.
--
-- Проверить, что таблица создалась, можно в Supabase Dashboard:
--   Table Editor -> contact_messages
-- ============================================================
