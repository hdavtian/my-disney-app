# Phase 1: Add @Table Annotations to Entities

**Time Required**: 5-10 minutes  
**Location**: IntelliJ IDEA - `C:\sites\hd-demos-api`

---

## Overview

You need to add `@Table` annotations to **5 entity classes** in the `shared-models` module. This tells JPA/Hibernate which database table name to use instead of the default (lowercase class name).

---

## Step-by-Step Instructions

### 1. Open the Project in IntelliJ IDEA

1. Launch **IntelliJ IDEA Ultimate**
2. **File** → **Open**
3. Navigate to: `C:\sites\hd-demos-api`
4. Click **OK**
5. Wait for IntelliJ to load and index the project

---

### 2. Navigate to the Entity Files

In the **Project** tool window (left side), expand:

```
hd-demos-api
└── shared-models
    └── src
        └── main
            └── java
                └── com
                    └── harmadavtian
                        └── shared
                            └── model
                                ├── Character.java         ← Disney entity
                                ├── Movie.java             ← Disney entity
                                ├── HeroMovieCarousel.java ← Disney entity
                                ├── Game.java              ← Sierra entity
                                ├── Screenshot.java        ← Sierra entity
                                └── GameStatus.java        (no changes needed)
```

---

### 3. Edit Character.java (Disney)

1. **Double-click** `Character.java` to open it
2. **Find** the `@Entity` annotation (should be near the top of the class)
3. **Add** the import statement at the top with other imports:
   ```java
   import jakarta.persistence.Table;
   ```
4. **Add** `@Table` annotation right after `@Entity`:

   ```java
   @Entity
   @Table(name = "disney_characters")
   public class Character {
       // ... rest of class
   ```

5. **Result** - The top of your class should look like:

   ```java
   package com.harmadavtian.shared.model;

   import jakarta.persistence.*;
   import lombok.*;
   import java.util.UUID;
   // ... other imports

   @Entity
   @Table(name = "disney_characters")  // ← NEW LINE
   @Data
   @NoArgsConstructor
   @AllArgsConstructor
   public class Character {
       @Id
       @GeneratedValue
       private UUID id;
       // ... rest of class
   ```

6. **Save**: `Ctrl + S` or **File** → **Save All**

---

### 4. Edit Movie.java (Disney)

1. **Double-click** `Movie.java` to open it
2. **Add** the import (if not already present):
   ```java
   import jakarta.persistence.Table;
   ```
3. **Add** `@Table` annotation after `@Entity`:

   ```java
   @Entity
   @Table(name = "disney_movies")
   public class Movie {
       // ... rest of class
   ```

4. **Save**: `Ctrl + S`

---

### 5. Edit HeroMovieCarousel.java (Disney)

1. **Double-click** `HeroMovieCarousel.java` to open it
2. **Add** the import:
   ```java
   import jakarta.persistence.Table;
   ```
3. **Add** `@Table` annotation after `@Entity`:

   ```java
   @Entity
   @Table(name = "disney_hero_carousel")
   public class HeroMovieCarousel {
       // ... rest of class
   ```

4. **Save**: `Ctrl + S`

---

### 6. Edit Game.java (Sierra)

1. **Double-click** `Game.java` to open it
2. **Add** the import:
   ```java
   import jakarta.persistence.Table;
   ```
3. **Add** `@Table` annotation after `@Entity`:

   ```java
   @Entity
   @Table(name = "sierra_games")
   public class Game {
       // ... rest of class
   ```

4. **Save**: `Ctrl + S`

---

### 7. Edit Screenshot.java (Sierra)

1. **Double-click** `Screenshot.java` to open it
2. **Add** the import:
   ```java
   import jakarta.persistence.Table;
   ```
3. **Add** `@Table` annotation after `@Entity`:

   ```java
   @Entity
   @Table(name = "sierra_screenshots")
   public class Screenshot {
       // ... rest of class
   ```

4. **Save**: `Ctrl + S`

---

### 8. Build the shared-models Module

Now rebuild the module to make sure everything compiles:

#### Option A: Using IntelliJ UI

1. Open the **Maven** tool window: **View** → **Tool Windows** → **Maven**
2. In the Maven tool window, expand:
   ```
   hd-demos-api
   └── shared-models
       └── Lifecycle
   ```
3. **Double-click** `clean`
4. Wait for it to finish
5. **Double-click** `install`
6. Wait for build to complete
7. Look for **BUILD SUCCESS** in the output

#### Option B: Using IntelliJ Terminal

1. Open the **Terminal** tool window: **View** → **Tool Windows** → **Terminal** (or `Alt + F12`)
2. Navigate to project root (if not already there):
   ```bash
   cd C:\sites\hd-demos-api\shared-models
   ```
3. Run Maven commands:
   ```bash
   mvn clean install
   ```
4. Wait for **BUILD SUCCESS**

---

### 9. Verify Changes

After successful build, verify your changes by opening any entity file and confirming:

✅ **Character.java**:

```java
@Entity
@Table(name = "disney_characters")
public class Character { ... }
```

✅ **Movie.java**:

```java
@Entity
@Table(name = "disney_movies")
public class Movie { ... }
```

✅ **HeroMovieCarousel.java**:

```java
@Entity
@Table(name = "disney_hero_carousel")
public class HeroMovieCarousel { ... }
```

✅ **Game.java**:

```java
@Entity
@Table(name = "sierra_games")
public class Game { ... }
```

✅ **Screenshot.java**:

```java
@Entity
@Table(name = "sierra_screenshots")
public class Screenshot { ... }
```

---

## Common Issues & Solutions

### Issue 1: "Cannot resolve symbol 'Table'"

**Solution**: Make sure you added the import statement:

```java
import jakarta.persistence.Table;
```

### Issue 2: IntelliJ shows red underline on @Table

**Solution**:

1. Click on the red underline
2. Press `Alt + Enter`
3. Select **Import class**
4. Choose `jakarta.persistence.Table`

### Issue 3: Build fails with compilation errors

**Solution**:

1. Check that all 5 files were saved (`Ctrl + S` or **File** → **Save All**)
2. Right-click on `shared-models` module → **Maven** → **Reimport**
3. Try build again

### Issue 4: "BUILD FAILURE" - dependency issues

**Solution**:

1. Right-click on root `hd-demos-api` → **Maven** → **Reload Project**
2. Wait for dependencies to download
3. Try build again

---

## Quick Reference: All Changes at a Glance

| File                     | Import                              | Annotation                              |
| ------------------------ | ----------------------------------- | --------------------------------------- |
| `Character.java`         | `import jakarta.persistence.Table;` | `@Table(name = "disney_characters")`    |
| `Movie.java`             | `import jakarta.persistence.Table;` | `@Table(name = "disney_movies")`        |
| `HeroMovieCarousel.java` | `import jakarta.persistence.Table;` | `@Table(name = "disney_hero_carousel")` |
| `Game.java`              | `import jakarta.persistence.Table;` | `@Table(name = "sierra_games")`         |
| `Screenshot.java`        | `import jakarta.persistence.Table;` | `@Table(name = "sierra_screenshots")`   |

---

## What This Accomplishes

Before these changes, JPA would try to use default table names:

- `Character` → tries to use table `character`
- `Movie` → tries to use table `movie`
- `Game` → tries to use table `game`

After these changes, JPA will use prefixed table names:

- `Character` → uses table `disney_characters` ✅
- `Movie` → uses table `disney_movies` ✅
- `HeroMovieCarousel` → uses table `disney_hero_carousel` ✅
- `Game` → uses table `sierra_games` ✅
- `Screenshot` → uses table `sierra_screenshots` ✅

This allows multiple projects to share the same database without table name conflicts!

---

## Next Steps

After completing Phase 1 and seeing **BUILD SUCCESS**:

1. ✅ Phase 1 Complete - Entity annotations added
2. ⏭️ **Phase 2** - Update migration SQL files (I'll help with this)
3. ⏭️ **Phase 5** - Create the `hd_demos` database
4. ⏭️ **Phase 6** - Run migrations
5. ⏭️ **Phase 7-8** - Test everything

---

**When you're done, let me know and we'll move to Phase 2!** 🚀
