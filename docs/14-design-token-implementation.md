# Design Token Implementation Guide

## Source of truth

Values live in the global theme/token layer. Components consume semantic names only.

## Required semantic tokens

```text
background
foreground
surface
primary
primary-foreground
secondary
secondary-foreground
accent
accent-foreground
calm
calm-foreground
border
muted
```

## Approved V1 values

```text
background             #FFF9F2
foreground             #111827
surface                #F3F0EA
primary                 #3657F5
primary-foreground      #FFFFFF
secondary               #1F3A5F
secondary-foreground    #FFFFFF
accent                  #FF6B4A
accent-foreground       #111827
calm                    #A8C7A1
calm-foreground         #111827
border                  #DEDAD3
muted                   #667085
```

## Good

```tsx
<Button variant="primary">Join Us</Button>
```

or project-configured token-backed utilities.

## Bad

```tsx
<button className="bg-blue-600 text-white ...">
```

```tsx
style={{ backgroundColor: "#3657F5" }}
```

## When to add a token

Add a token only when:
1. it represents a reusable semantic role;
2. current tokens cannot express the need cleanly;
3. design-system documentation is updated;
4. contrast/state behavior is defined.

Do not create names such as `blue2`, `specialOrange`, or page-specific colors.

## Component variants

Prefer semantic variants:
- primary
- secondary
- outline
- ghost
- destructive if needed
- accent/calm only where there is a reusable product meaning

Avoid color-named variants such as `blue`, `orange`, `green`.
