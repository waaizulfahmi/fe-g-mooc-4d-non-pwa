/* eslint-disable jsx-a11y/alt-text */
import {
    Document,
    Font,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
} from "@react-pdf/renderer";

import PropTypes from "prop-types";

// Import font
Font.register({
    family: "Montserrat-medium",
    src: "/font/Montserrat-Medium.ttf",
});

Font.register({
    family: "Montserrat-black",
    src: "/font/Montserrat-Black.ttf",
});

const styles = StyleSheet.create({
    page: {
        backgroundColor: "white",
        width: "100%",
        height: "100%",
    },
    container: {
        display: "flex",
        flexDirection: "row",
    },
    leftSection: {
        flex: 11,
        padding: 20,
        marginLeft: 30,
        position: "relative",
    },
    sectionLogo: {
        display: "flex",
        position: "absolute",
        padding: 20,
    },
    sectionSuccess: {
        marginTop: 20,
        color: "#006E68",
        fontFamily: "Montserrat-medium",
    },
    rightSection: {
        flex: 1,
        padding: 20,
    },
    bottomSection: {
        marginTop: 30,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: 40,
        justifyContent: "space-between",
    },
    textName: {
        fontSize: 25,
        marginTop: 250,
        color: "#006E68",
        fontFamily: "Montserrat-black",
    },
    imageSide: {
        width: 70,
        height: "100%",
    },
    imageLogo: {
        marginTop: 30,
        width: 100,
        height: 40,
    },
    imageSerLus: {
        width: 280,
        height: 70,
        marginTop: 70,
    },
    signature: {
        width: 100,
        height: 90,
    },
    award: {
        width: 100,
        height: 100,
    },
});

const Certificate = ({ name, kelas }) => {
    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                <View style={styles.container}>
                    <View style={styles.leftSection}>
                        <View style={styles.sectionLogo}>
                            <Image
                                src="/images/logo.png"
                                style={styles.imageLogo}
                            />
                            <Image
                                src="/images/serlus.png"
                                style={styles.imageSerLus}
                            />
                        </View>
                        <Text style={styles.textName}>{name}</Text>
                        <Text style={styles.sectionSuccess}>
                            Telah Berhasil Menyelesaikan Kelas {kelas} Pada
                            G-MOOC 4D
                        </Text>
                        <View style={styles.bottomSection}>
                            <Image
                                src="/images/ttd.png"
                                style={styles.signature}
                            />
                            <Image
                                src="/images/award.png"
                                style={styles.award}
                            />
                        </View>
                    </View>
                    <View style={styles.rightSection}>
                        <Image
                            src="/images/side.png"
                            style={styles.imageSide}
                        />
                    </View>
                </View>
            </Page>
        </Document>
    );
};

Certificate.propTypes = {
    name: PropTypes.string,
    kelas: PropTypes.string,
};

export default Certificate;
