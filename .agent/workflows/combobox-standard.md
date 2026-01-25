---
description: how to implement premium Combobox/Select surfaces
---

Follow these steps when an area in the UI needs a selection dropdown with search capabilities:

1.  **Do NOT use native `<select>` elements**. The project uses a standardized premium Combobox.

2.  **Use the `Combobox` component**. This component provides:
    -   Premium portals-based dropdown (avoids clipping).
    -   Integrated `ScrollArea` with dynamic shadows.
    -   Built-in search/filtering.
    -   Icon support.

3.  **Import the component**:
    ```tsx
    import Combobox from '../components/ui/Combobox';
    ```

4.  **Prepare your options**:
    ```tsx
    const options = [
        { value: 'id1', label: 'Option 1', description: 'Subtext here', icon: <Icon /> },
        { value: 'id2', label: 'Option 2' },
    ];
    ```

5.  **Implementation**:
    ```tsx
    <Combobox
        options={options}
        value={selectedValue}
        onChange={setSelectedValue}
        placeholder="Pilih item..."
        searchPlaceholder="Cari item..."
        loading={isLoading}
        disabled={isDisabled}
    />
    ```

6.  **Contexts**:
    -   **Modals**: Use for any internal selection or categorization.
    -   **Filters**: Perfect for table filters or complex search forms.
    -   **Settings**: Use for configuration choices.
