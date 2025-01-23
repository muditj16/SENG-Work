import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.*;
import java.util.stream.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.*;
import org.junit.jupiter.params.provider.*;

class InvoiceFilterTest {
    private InvoiceFilter invoiceFilter;
    private IssuedInvoices issuedInvoices;

    @Test
    void allHighValueInvoices() {
        IssuedInvoices issuedInvoicesMock = mock(IssuedInvoices.class);
        invoiceFilter = new InvoiceFilter(issuedInvoicesMock);
        when(issuedInvoicesMock.all()).thenReturn(List.of(new Invoice(150), new Invoice(200)));
        assertThat(invoiceFilter.lowValueInvoices()).isEmpty();
        verify(issuedInvoicesMock).all();
    }

    @Test
    void allLowValueInvoices() {
        IssuedInvoices issuedInvoicesMock = mock(IssuedInvoices.class, withSettings().verboseLogging());
        invoiceFilter = new InvoiceFilter(issuedInvoicesMock);
        when(issuedInvoicesMock.all()).thenReturn(List.of(new Invoice(43), new Invoice(99)));
        assertThat(invoiceFilter.lowValueInvoices()).containsExactly(new Invoice(43), new Invoice(99));
        verify(issuedInvoicesMock).all();

    }

    @Test
    void someLowValueInvoices() {
        IssuedInvoices issuedInvoicesMock = mock(IssuedInvoices.class);
        invoiceFilter = new InvoiceFilter(issuedInvoicesMock);
        when(issuedInvoicesMock.all()).thenReturn(List.of(new Invoice(44), new Invoice(150), new Invoice(99), new Invoice(200)));
        assertThat(invoiceFilter.lowValueInvoices()).containsExactlyInAnyOrder(new Invoice(44), new Invoice(99));
        verify(issuedInvoicesMock).all();
        // Some low value invoices, some high
    }

}

