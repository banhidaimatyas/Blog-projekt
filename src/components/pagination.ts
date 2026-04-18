export interface PaginationOptions {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export function renderPagination(container: HTMLElement, options: PaginationOptions): void {
    const { currentPage, totalItems, itemsPerPage, onPageChange } = options;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    const pageButtons: string[] = [];

    pageButtons.push(`
        <button
            class="page-btn ${currentPage === 1 ? 'disabled' : ''}"
            data-page="${currentPage - 1}"
            ${currentPage === 1 ? 'disabled' : ''}
        >
        ‹ Előző
        </button>
    `);
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

    if (startPage > 1) {
        pageButtons.push(`<button class="page-btn" data-page="1">1</button>`);
        if (startPage > 2) {
            pageButtons.push(`<span class="page-ellipsis">…</span>`);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        pageButtons.push(`
        <button
            class="page-btn ${i === currentPage ? 'active' : ''}"
            data-page="${i}"
        >
        ${i}
        </button>
    `);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pageButtons.push(`<span class="page-ellipsis">…</span>`);
        }
        pageButtons.push(`<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`);
    }

    pageButtons.push(`
    <button
        class="page-btn ${currentPage === totalPages ? 'disabled' : ''}"
        data-page="${currentPage + 1}"
        ${currentPage === totalPages ? 'disabled' : ''}
    >
        Következő ›
    </button>
    `);

    container.innerHTML = `
    <div class="pagination">
        ${pageButtons.join('')}
        <span class="page-info">${currentPage} / ${totalPages} oldal (${totalItems} bejegyzés)</span>
    </div>
    `;

    container.querySelectorAll<HTMLButtonElement>('.page-btn:not(.disabled)').forEach((btn) => {
        btn.addEventListener('click', () => {
            const page = parseInt(btn.dataset['page'] ?? '1', 10);
            if (page !== currentPage) {
                onPageChange(page);
            }
        });
    });
}
